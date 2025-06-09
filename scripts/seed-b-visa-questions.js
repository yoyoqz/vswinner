const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

const bVisaQuestions = [
  {
    question: "What is the difference between B-1 and B-2 visas?",
    answer: `<p>B-1 and B-2 visas are both temporary nonimmigrant visas, but they serve different purposes:</p>
    <h4>B-1 Business Visa:</h4>
    <ul>
      <li>For business activities such as meetings, conferences, consultations</li>
      <li>Negotiating contracts or settling business matters</li>
      <li>Short-term training or professional development</li>
      <li>Cannot receive payment from U.S. sources for work performed</li>
    </ul>
    <h4>B-2 Tourist Visa:</h4>
    <ul>
      <li>For tourism, vacation, and leisure activities</li>
      <li>Visiting friends and family</li>
      <li>Medical treatment</li>
      <li>Participating in amateur sports or cultural events</li>
    </ul>
    <p>Many people receive a combined B-1/B-2 visa that allows both business and tourism activities.</p>`,
    order: 1
  },
  {
    question: "How long can I stay in the U.S. with a B visa?",
    answer: `<p>The length of stay depends on several factors:</p>
    <ul>
      <li><strong>Visa validity:</strong> B visas can be issued for various periods (6 months to 10 years), but this doesn't determine your permitted stay</li>
      <li><strong>I-94 admission record:</strong> The CBP officer at the port of entry determines your actual permitted stay, typically up to 6 months</li>
      <li><strong>Extensions:</strong> You may apply for an extension of stay in 6-month increments, up to a maximum of 1 year total</li>
      <li><strong>Multiple entries:</strong> A valid B visa allows multiple entries during its validity period</li>
    </ul>
    <p><strong>Important:</strong> Always check your I-94 record online for your authorized period of stay.</p>`,
    order: 2
  },
  {
    question: "What documents do I need for a B visa interview?",
    answer: `<h4>Required Documents:</h4>
    <ul>
      <li>Valid passport (must be valid for at least 6 months beyond intended stay)</li>
      <li>DS-160 confirmation page</li>
      <li>Visa application fee payment receipt</li>
      <li>Passport-style photograph (if not uploaded with DS-160)</li>
    </ul>
    <h4>Supporting Documents:</h4>
    <ul>
      <li><strong>Financial evidence:</strong> Bank statements, employment letter, tax returns</li>
      <li><strong>Ties to home country:</strong> Property ownership, family ties, employment</li>
      <li><strong>Travel plans:</strong> Itinerary, hotel reservations, return tickets</li>
      <li><strong>For B-1:</strong> Business letters, conference registration, meeting invitations</li>
      <li><strong>For B-2:</strong> Tourist plans, family/friend contact information</li>
    </ul>
    <p>Organize documents clearly and bring originals with copies.</p>`,
    order: 3
  },
  {
    question: "Can I work in the U.S. with a B visa?",
    answer: `<p><strong>Generally, NO.</strong> B visa holders cannot engage in employment or receive payment from U.S. sources.</p>
    <h4>What's NOT allowed:</h4>
    <ul>
      <li>Working for a U.S. employer</li>
      <li>Receiving salary or wages from U.S. sources</li>
      <li>Performing skilled or unskilled labor</li>
      <li>Running a business in the U.S.</li>
    </ul>
    <h4>Limited exceptions for B-1:</h4>
    <ul>
      <li>Attending business meetings or conferences</li>
      <li>Negotiating contracts (but not performing the work)</li>
      <li>Training sessions (if paid by foreign employer)</li>
      <li>Participating in professional conferences</li>
    </ul>
    <p><strong>Violation consequences:</strong> Working without authorization can result in visa cancellation, removal from the U.S., and future visa denials.</p>`,
    order: 4
  },
  {
    question: "How do I extend my B visa stay?",
    answer: `<p>To extend your stay, you must file Form I-539 with USCIS <strong>before</strong> your authorized stay expires.</p>
    <h4>Requirements:</h4>
    <ul>
      <li>File at least 45 days before your I-94 expiration date</li>
      <li>Demonstrate continued eligibility for B status</li>
      <li>Show compelling reasons for extension</li>
      <li>Prove sufficient funds for extended stay</li>
      <li>Maintain intent to depart the U.S.</li>
    </ul>
    <h4>Process:</h4>
    <ol>
      <li>Complete Form I-539 online or by mail</li>
      <li>Pay the $370 filing fee (plus $85 biometrics fee if required)</li>
      <li>Submit supporting documents</li>
      <li>Attend biometrics appointment if scheduled</li>
      <li>Wait for USCIS decision</li>
    </ol>
    <p><strong>Important:</strong> You can legally remain in the U.S. while your extension is pending, even if your I-94 expires.</p>`,
    order: 5
  },
  {
    question: "What are common reasons for B visa denial?",
    answer: `<h4>Most Common Denial Reasons:</h4>
    <ul>
      <li><strong>Insufficient ties to home country:</strong> Cannot demonstrate strong reasons to return home</li>
      <li><strong>Immigration intent:</strong> Officer believes you intend to stay permanently</li>
      <li><strong>Inadequate financial support:</strong> Cannot show ability to fund your stay</li>
      <li><strong>Unclear purpose of visit:</strong> Vague or inconsistent travel plans</li>
      <li><strong>Previous immigration violations:</strong> History of overstaying or other violations</li>
    </ul>
    <h4>How to Avoid Denial:</h4>
    <ul>
      <li>Prepare strong evidence of home country ties</li>
      <li>Provide clear, detailed travel itinerary</li>
      <li>Demonstrate sufficient financial resources</li>
      <li>Be honest and consistent in your application</li>
      <li>Bring organized, relevant supporting documents</li>
    </ul>
    <p><strong>If denied:</strong> You may reapply, but address the specific reasons for denial in your new application.</p>`,
    order: 6
  },
  {
    question: "Can I change from B visa to another status while in the U.S.?",
    answer: `<p><strong>Yes, in some cases</strong> you can apply to change your status to certain other nonimmigrant categories.</p>
    <h4>Possible Changes:</h4>
    <ul>
      <li><strong>F-1 (Student):</strong> If accepted to a SEVP-approved school</li>
      <li><strong>H-1B (Specialty Occupation):</strong> If you have a job offer and meet requirements</li>
      <li><strong>L-1 (Intracompany Transfer):</strong> If transferring within your company</li>
      <li><strong>O-1 (Extraordinary Ability):</strong> If you qualify for this specialized category</li>
    </ul>
    <h4>Requirements:</h4>
    <ul>
      <li>File Form I-539 before your I-94 expires</li>
      <li>Maintain legal status throughout the process</li>
      <li>Meet all requirements for the new status</li>
      <li>Pay applicable fees</li>
    </ul>
    <h4>Restrictions:</h4>
    <ul>
      <li>Cannot change to immigrant status (green card) from B visa</li>
      <li>Some categories may require departure and consular processing</li>
    </ul>`,
    order: 7
  },
  {
    question: "What should I do if I overstay my B visa?",
    answer: `<p><strong>Overstaying is a serious immigration violation</strong> with significant consequences.</p>
    <h4>Immediate Consequences:</h4>
    <ul>
      <li>Automatic visa cancellation</li>
      <li>Accrual of unlawful presence</li>
      <li>Ineligibility for future visa applications in the U.S.</li>
      <li>Potential removal proceedings</li>
    </ul>
    <h4>Long-term Consequences:</h4>
    <ul>
      <li><strong>180+ days overstay:</strong> 3-year bar from entering the U.S.</li>
      <li><strong>1+ year overstay:</strong> 10-year bar from entering the U.S.</li>
      <li>Difficulty obtaining future U.S. visas</li>
      <li>Permanent record in immigration system</li>
    </ul>
    <h4>What to Do:</h4>
    <ol>
      <li>Depart the U.S. immediately to minimize unlawful presence</li>
      <li>Consult with an immigration attorney</li>
      <li>Understand your options for future travel to the U.S.</li>
      <li>Consider applying for a waiver if eligible</li>
    </ol>`,
    order: 8
  }
];

async function seedBVisaQuestions() {
  console.log('Starting to seed B visa questions...');
  
  try {
    // Clear existing B visa questions
    await prisma.bVisaQuestion.deleteMany({});
    console.log('Cleared existing B visa questions');

    // Insert new questions
    for (const question of bVisaQuestions) {
      await prisma.bVisaQuestion.create({
        data: question
      });
      console.log(`Added question: ${question.question.substring(0, 50)}...`);
    }

    console.log(`Successfully seeded ${bVisaQuestions.length} B visa questions!`);
  } catch (error) {
    console.error('Error seeding B visa questions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedBVisaQuestions()
  .then(() => {
    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  }); 