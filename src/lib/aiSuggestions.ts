import { prisma } from '@/lib/prisma';

export interface AIUsageLimit {
  used: number;
  limit: number;
  canUse: boolean;
  membershipType: string | null;
}

// 根据会员类型获取AI建议使用限制
export function getAIUsageLimit(membershipName: string | null): number {
  if (!membershipName) return 0;
  
  // 转换为小写进行匹配，更宽松的匹配规则
  const lowerName = membershipName.toLowerCase();
  
  // 匹配基础/一月会员
  if (lowerName.includes('basic') || lowerName.includes('一月') || lowerName.includes('基础')) {
    return 10; // 一月会员10次
  }
  
  // 匹配高级/三月会员
  if (lowerName.includes('premium') || lowerName.includes('三月') || lowerName.includes('高级')) {
    return 40; // 三月会员40次
  }
  
  // 匹配企业/半年会员
  if (lowerName.includes('enterprise') || lowerName.includes('半年') || lowerName.includes('企业')) {
    return 100; // 半年会员100次
  }
  
  // 原始精确匹配作为后备
  switch (membershipName) {
    case 'Basic Plan':
      return 10;
    case 'Premium Plan':
      return 40;
    case 'Enterprise Plan':
      return 100;
    default:
      console.warn(`Unknown membership type: ${membershipName}`);
      return 0; // 无法识别的会员类型
  }
}

// 检查用户是否可以使用AI建议
export async function checkAIUsageLimit(userId: string): Promise<AIUsageLimit> {
  try {
    // 获取用户信息包括当前的使用次数
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userMemberships: {
          where: {
            status: 'ACTIVE',
            endDate: { gt: new Date() }
          },
          include: {
            membership: true
          },
          orderBy: {
            endDate: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 获取用户当前的会员类型
    const activeMembership = user.userMemberships[0];
    const membershipName = activeMembership?.membership.name || null;
    let limit = getAIUsageLimit(membershipName);
    
    // 临时解决方案：如果有活跃会员但limit为0，根据会员持续时间给予默认额度
    if (activeMembership && limit === 0) {
      const duration = activeMembership.membership.duration;
      if (duration <= 30) { // 1个月
        limit = 10;
      } else if (duration <= 90) { // 3个月
        limit = 40;
      } else { // 6个月及以上
        limit = 100;
      }
      console.log(`Applied fallback limit based on duration: ${duration} days -> ${limit} uses`);
    }

    // 检查是否需要重置使用次数（每个会员周期重置）
    const now = new Date();
    let shouldReset = false;

    if (activeMembership && user.aiSuggestionsResetDate) {
      // 如果有重置日期，检查是否已经过了会员周期
      const membershipStartDate = new Date(activeMembership.startDate);
      const lastResetDate = new Date(user.aiSuggestionsResetDate);
      
      // 如果会员开始日期晚于上次重置日期，说明是新的会员周期
      if (membershipStartDate > lastResetDate) {
        shouldReset = true;
      }
    } else if (activeMembership && !user.aiSuggestionsResetDate) {
      // 如果有会员但没有重置日期，设置重置日期为会员开始日期
      shouldReset = true;
    }

    // 重置使用次数
    if (shouldReset && activeMembership) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          aiSuggestionsUsed: 0,
          aiSuggestionsResetDate: activeMembership.startDate
        }
      });
      user.aiSuggestionsUsed = 0;
    }

    // 如果没有会员（limit为0），则不能使用；如果有会员，检查是否超过限制
    const canUse = limit > 0 && user.aiSuggestionsUsed < limit;

    return {
      used: user.aiSuggestionsUsed,
      limit,
      canUse,
      membershipType: membershipName
    };

  } catch (error) {
    console.error('Error checking AI usage limit:', error);
    throw error;
  }
}

// 增加AI建议使用次数
export async function incrementAIUsage(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiSuggestionsUsed: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error('Error incrementing AI usage:', error);
    throw error;
  }
} 