import { prisma } from '@/lib/prisma';

export const defaultMembershipPlans = [
  {
    name: 'Basic Plan',
    description: 'Perfect for individuals who need basic visa guidance and support.',
    price: 20,
    duration: 30, // 1 month
    features: [
      'Access to basic visa information',
      'Email support',
      'Standard processing guides',
      'Community forum access',
    ],
    active: true,
    order: 1,
  },
  {
    name: 'Premium Plan',
    description: 'Ideal for professionals and frequent travelers with comprehensive needs.',
    price: 50,
    duration: 90, // 3 months
    features: [
      'All Basic Plan features',
      'Advanced visa processing guides',
      'One-on-one consultation (1 hour)',
      'Document review service',
      'Video tutorials access',
    ],
    active: true,
    order: 2,
  },
  {
    name: 'Enterprise Plan',
    description: 'Complete visa solution for businesses and immigration professionals.',
    price: 80,
    duration: 180, // 6 months
    features: [
      'All Premium Plan features',
      '8/7 priority support',
      'Unlimited consultations',
      'Custom document templates',
      'Bulk application processing',
      'Dedicated account manager',
    ],
    active: true,
    order: 3,
  },
];

export async function seedMembershipPlans() {
  try {
    console.log('🌱 Seeding membership plans...');
    
    // Check if plans already exist
    const existingPlans = await prisma.membership.findMany();
    if (existingPlans.length > 0) {
      console.log('✅ Membership plans already exist, skipping seed');
      return existingPlans;
    }

    // Create default plans
    const createdPlans = [];
    for (const plan of defaultMembershipPlans) {
      const created = await prisma.membership.create({
        data: plan,
      });
      createdPlans.push(created);
      console.log(`✅ Created membership plan: ${plan.name}`);
    }

    console.log(`🎉 Successfully seeded ${createdPlans.length} membership plans`);
    return createdPlans;
  } catch (error) {
    console.error('❌ Error seeding membership plans:', error);
    throw error;
  }
}

export async function resetMembershipPlans() {
  try {
    console.log('🔄 Resetting membership plans...');
    
    // Delete existing plans
    await prisma.membership.deleteMany();
    console.log('🗑️ Deleted existing membership plans');
    
    // Create fresh plans
    const plans = await seedMembershipPlans();
    console.log('✅ Membership plans reset successfully');
    return plans;
  } catch (error) {
    console.error('❌ Error resetting membership plans:', error);
    throw error;
  }
} 