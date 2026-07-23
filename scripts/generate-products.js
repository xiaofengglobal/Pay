const ProductService = require('../src/services/products');

async function generateAllProducts() {
  console.log('Generating product files...');
  const productService = new ProductService();
  
  try {
    console.log('✓ Generating Starter Kit...');
    await productService.generateStarterKit();
    
    console.log('✓ Generating Professional Course...');
    await productService.generateProfessionalCourse();
    
    console.log('✓ Generating Enterprise Plan...');
    await productService.generateEnterprisePlan();
    
    console.log('✓ Creating resource zips...');
    await productService.createResourceZips();
    
    console.log('✓ All product files generated successfully!');
  } catch (error) {
    console.error('Error generating products:', error);
    process.exit(1);
  }
}

generatAllProducts();
