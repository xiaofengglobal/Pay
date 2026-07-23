const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class ProductService {
  constructor() {
    this.productsPath = process.env.PRODUCTS_PATH || '/home/ubuntu/pay/products';
    this.ensureProductsDirectory();
  }

  ensureProductsDirectory() {
    if (!fs.existsSync(this.productsPath)) {
      fs.mkdirSync(this.productsPath, { recursive: true });
    }
  }

  generateStarterKit() {
    const filePath = path.join(this.productsPath, 'guide.pdf');
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Cover page
    doc.fontSize(28).font('Helvetica-Bold').text('Starter Kit', 100, 100);
    doc.fontSize(14).font('Helvetica').text('Self-Guided Growth Strategy', 100, 150);
    doc.fontSize(10).text('Xiaofeng Global', 100, 200);
    doc.text(new Date().toLocaleDateString(), 100, 220);

    // Add content
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Table of Contents', 50, 50);
    const toc = [
      '1. Introduction',
      '2. Core Strategy Playbook',
      '3. Self-Guided Setup Guide',
      '4. Tools and Resources',
      '5. Email Support',
      '6. Terms and Conditions'
    ];
    let y = 100;
    toc.forEach(item => {
      doc.fontSize(11).font('Helvetica').text(item, 50, y);
      y += 20;
    });

    // Section 1: Introduction
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('1. Introduction', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'This comprehensive guide is designed to help you build and grow your independent site using proven strategies and best practices. '
      + 'Throughout this document, you will find actionable insights, step-by-step instructions, and valuable resources to accelerate your journey. '
      + 'Our self-guided approach empowers you to work at your own pace while maintaining access to professional support.',
      50, 100, { width: 500, align: 'left' }
    );

    // Section 2: Core Strategy Playbook
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('2. Core Strategy Playbook', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'Strategy Overview:\n\n'
      + '• Foundation Building: Establish your digital presence with strong fundamentals\n'
      + '• Market Research: Understand your target audience and competitors\n'
      + '• Value Proposition: Clearly communicate your unique value\n'
      + '• Growth Channels: Identify and optimize multiple revenue streams\n'
      + '• Sustainability: Build systems for long-term success\n\n'
      + 'Implementation Timeline:\n'
      + '- Week 1-2: Foundation and setup\n'
      + '- Week 3-4: Market research and positioning\n'
      + '- Week 5-8: Initial launch and optimization\n'
      + '- Month 3+: Scale and expand',
      50, 100, { width: 500, align: 'left' }
    );

    // Section 3: Setup Guide
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('3. Self-Guided Setup Guide', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'Step 1: Infrastructure Setup\n'
      + '- Choose your platform\n'
      + '- Configure domain and SSL\n'
      + '- Set up basic pages\n\n'
      + 'Step 2: Content Strategy\n'
      + '- Define your messaging\n'
      + '- Create content calendar\n'
      + '- Establish posting schedule\n\n'
      + 'Step 3: Launch Preparation\n'
      + '- Final testing\n'
      + '- Marketing materials\n'
      + '- Analytics setup\n\n'
      + 'Step 4: Go Live\n'
      + '- Launch announcement\n'
      + '- Monitor performance\n'
      + '- Gather feedback',
      50, 100, { width: 500, align: 'left' }
    );

    // Section 4: Tools and Resources
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('4. Recommended Tools & Resources', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'Development Tools:\n'
      + '• VS Code - Code editor\n'
      + '• GitHub - Version control\n'
      + '• Node.js - Backend runtime\n\n'
      + 'Hosting & Infrastructure:\n'
      + '• AWS - Cloud infrastructure\n'
      + '• Vercel - Frontend deployment\n'
      + '• MongoDB - Database\n\n'
      + 'Analytics & Monitoring:\n'
      + '• Google Analytics\n'
      + '• Sentry - Error tracking\n'
      + '• DataDog - Performance monitoring',
      50, 100, { width: 500, align: 'left' }
    );

    // Section 5: Support
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('5. Email Support', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'Support Details:\n'
      + 'Email: support@xiaofenghome.com\n'
      + 'Response Time: Within 24-48 hours\n'
      + 'Support Channel: Email only\n'
      + 'Support Duration: Included with Starter plan\n\n'
      + 'What We Support:\n'
      + '• General questions about the guide\n'
      + '• Technical troubleshooting\n'
      + '• Best practices consultation\n'
      + '• Resource recommendations',
      50, 100, { width: 500, align: 'left' }
    );

    // Section 6: Terms
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('6. Terms & Conditions', 50, 50);
    doc.fontSize(10).font('Helvetica').text(
      'By purchasing and accessing this material, you agree to:\n\n'
      + '• Use this guide for personal, non-commercial purposes\n'
      + '• Not resell or redistribute the content\n'
      + '• Respect intellectual property rights\n'
      + '• Provide feedback for continuous improvement\n\n'
      + 'Disclaimer:\n'
      + 'Results may vary. Past performance does not guarantee future results. '
      + 'While we provide comprehensive guidance, individual results depend on effort, market conditions, and implementation.',
      50, 100, { width: 500, align: 'left' }
    );

    doc.end();
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  generateProfessionalCourse() {
    const filePath = path.join(this.productsPath, 'course.pdf');
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Similar structure as starter, but with more content
    doc.fontSize(28).font('Helvetica-Bold').text('Professional Plan', 100, 100);
    doc.fontSize(14).font('Helvetica').text('Complete Consulting + Full Access Bundle', 100, 150);

    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('What\'s Included', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'This comprehensive bundle includes:\n\n'
      + '✓ Everything from the Starter Kit\n'
      + '✓ Advanced system documentation\n'
      + '✓ Full access to all resources\n'
      + '✓ 1-on-1 consultation session\n'
      + '✓ Priority email support (30 days)\n'
      + '✓ Advanced implementation strategies\n'
      + '✓ Custom recommendations\n'
      + '✓ Exclusive templates and tools',
      50, 120, { width: 500, align: 'left' }
    );

    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Consultation Framework', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'Your 1-on-1 consultation includes:\n\n'
      + '• Initial assessment (15 min)\n'
      + '• Strategy discussion (30 min)\n'
      + '• Action plan creation (30 min)\n'
      + '• Q&A and follow-up (15 min)\n\n'
      + 'How to schedule:\n'
      + 'Email support@xiaofenghome.com with your availability. '
      + 'We\'ll coordinate timing within 5 business days.',
      50, 120, { width: 500, align: 'left' }
    );

    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Advanced Documentation', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'Technical Implementation:\n'
      + '• System architecture best practices\n'
      + '• Security hardening guide\n'
      + '• Performance optimization\n'
      + '• Scalability strategies\n'
      + '• Monitoring and alerting setup\n\n'
      + 'Business Operations:\n'
      + '• Team structure and roles\n'
      + '• Process automation\n'
      + '• Financial management\n'
      + '• Customer relationship management',
      50, 120, { width: 500, align: 'left' }
    );

    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Priority Support (30 Days)', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'During the first 30 days after purchase:\n\n'
      + '• Email response within 12 hours (business days)\n'
      + '• Direct consultation for complex issues\n'
      + '• Custom recommendations\n'
      + '• Implementation assistance\n'
      + '• Unlimited revisions and refinements\n\n'
      + 'Support includes guidance on:\n'
      + '• Technical troubleshooting\n'
      + '• Strategy optimization\n'
      + '• Best practices implementation\n'
      + '• Resource utilization',
      50, 120, { width: 500, align: 'left' }
    );

    doc.end();
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  generateEnterprisePlan() {
    const filePath = path.join(this.productsPath, 'deployment-guide.pdf');
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(28).font('Helvetica-Bold').text('Enterprise Plan', 100, 100);
    doc.fontSize(14).font('Helvetica').text('Fully Managed Deployment + 24/7 Support', 100, 150);

    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Enterprise Package', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'Complete enterprise solution includes:\n\n'
      + '✓ All Professional Plan benefits\n'
      + '✓ Global infrastructure deployment\n'
      + '✓ Dedicated account manager\n'
      + '✓ 24/7 technical support\n'
      + '✓ Custom integration services\n'
      + '✓ Advanced security protocols\n'
      + '✓ Performance optimization\n'
      + '✓ Quarterly business reviews\n'
      + '✓ Disaster recovery planning\n'
      + '✓ Unlimited consultation hours',
      50, 120, { width: 500, align: 'left' }
    );

    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Global Infrastructure', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'Deployment Strategy:\n'
      + '• Multi-region deployment\n'
      + '• Load balancing optimization\n'
      + '• CDN configuration\n'
      + '• Database replication\n'
      + '• Backup strategies\n\n'
      + 'Regions:\n'
      + '• North America (US-East, US-West)\n'
      + '• Europe (EU-Central, EU-West)\n'
      + '• Asia (Singapore, Tokyo)\n'
      + '• Additional regions on request',
      50, 120, { width: 500, align: 'left' }
    );

    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('24/7 Support SLA', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'Support Levels:\n'
      + 'P1 (Critical): 1-hour response time\n'
      + 'P2 (High): 4-hour response time\n'
      + 'P3 (Medium): 8-hour response time\n'
      + 'P4 (Low): 24-hour response time\n\n'
      + 'Support Channels:\n'
      + '• 24/7 phone support\n'
      + '• Email support\n'
      + '• Dedicated Slack channel\n'
      + '• Video conference support\n'
      + '• On-site support available',
      50, 120, { width: 500, align: 'left' }
    );

    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Disaster Recovery', 50, 50);
    doc.fontSize(11).font('Helvetica').text(
      'Recovery Protocols:\n'
      + '• RTO: 1 hour (Recovery Time Objective)\n'
      + '• RPO: 15 minutes (Recovery Point Objective)\n'
      + '• Automated failover systems\n'
      + '• Regular disaster recovery drills\n'
      + '• Backup redundancy\n\n'
      + 'Documentation:\n'
      + '• Detailed recovery procedures\n'
      + '• Contact escalation matrix\n'
      + '• Runbook for each scenario\n'
      + '• Regular testing and validation',
      50, 120, { width: 500, align: 'left' }
    );

    doc.end();
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  async createResourceZips() {
    // Professional resources
    await this.createZip(
      path.join(this.productsPath, 'professional-resources.zip'),
      [
        { name: 'templates/', data: 'Professional templates and worksheets' },
        { name: 'tools.txt', data: 'Recommended tools and services' },
        { name: 'checklist.txt', data: 'Implementation checklist' }
      ]
    );

    // Enterprise resources
    await this.createZip(
      path.join(this.productsPath, 'enterprise-resources.zip'),
      [
        { name: 'infrastructure/', data: 'Infrastructure templates' },
        { name: 'deployment-scripts/', data: 'Deployment automation' },
        { name: 'monitoring/', data: 'Monitoring setup' },
        { name: 'api-docs/', data: 'API documentation' }
      ]
    );
  }

  createZip(zipPath, files) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip');

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.finalize();
    });
  }
}

module.exports = ProductService;
