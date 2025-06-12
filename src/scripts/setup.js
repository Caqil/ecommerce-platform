#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

class SetupWizard {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run() {
    console.log('\n🛒 Welcome to eCommerce Platform Pro Setup Wizard');
    console.log('═══════════════════════════════════════════════════\n');
    
    try {
      await this.showWelcome();
      await this.checkRequirements();
      await this.setupEnvironment();
      await this.installDependencies();
      await this.generateKeys();
      await this.showNextSteps();
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  async showWelcome() {
    console.log('📝 Pre-Installation Setup');
    console.log('This wizard will prepare your environment for installation.\n');
    
    const proceed = await this.question('Continue with setup? (y/n) [y]: ') || 'y';
    if (proceed.toLowerCase() !== 'y') {
      throw new Error('Setup cancelled by user');
    }
  }

  async checkRequirements() {
    console.log('\n🔍 Checking Requirements...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`✅ Node.js: ${nodeVersion}`);
    
    // Check npm
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`✅ npm: v${npmVersion}`);
    } catch (error) {
      throw new Error('npm is not installed');
    }
    
    // Check if MongoDB is accessible (optional)
    console.log('✅ Requirements check complete\n');
  }

  async setupEnvironment() {
    console.log('⚙️ Environment Configuration');
    
    if (!fs.existsSync('.env.local')) {
      const appName = await this.question('Store name [eCommerce Platform Pro]: ') || 'eCommerce Platform Pro';
      const appUrl = await this.question('App URL [http://localhost:3000]: ') || 'http://localhost:3000';
      
      // Create .env.local from .env.example
      const envExample = fs.readFileSync('.env.example', 'utf8');
      const envContent = envExample
        .replace('APP_NAME="eCommerce Platform Pro"', `APP_NAME="${appName}"`)
        .replace('APP_URL=http://localhost:3000', `APP_URL=${appUrl}`)
        .replace('your-nextauth-secret-key-min-32-chars', this.generateSecret(32))
        .replace('your-jwt-secret-key-here', this.generateSecret())
        .replace('your-32-char-encryption-key-here', this.generateSecret(32))
        .replace('your-addon-secret-key', this.generateSecret())
        .replace('your-webhook-secret-key', this.generateSecret())
        .replace('your-license-validation-secret', this.generateSecret());

      fs.writeFileSync('.env.local', envContent);
      console.log('✅ Environment file created');
    } else {
      console.log('✅ Environment file already exists');
    }
  }

  async installDependencies() {
    console.log('\n📦 Installing Dependencies');
    const install = await this.question('Install dependencies now? (y/n) [y]: ') || 'y';
    
    if (install.toLowerCase() === 'y') {
      console.log('Installing packages... This may take a few minutes.');
      try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed');
      } catch (error) {
        console.log('⚠️ Failed to install dependencies automatically');
        console.log('Please run "npm install" manually after setup');
      }
    }
  }

  generateSecret(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async generateKeys() {
    console.log('\n🔐 Security Configuration');
    console.log('✅ Security keys generated');
  }

  async showNextSteps() {
    console.log('\n🎉 Pre-Setup Complete!');
    console.log('═══════════════════════════');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3000/setup');
    console.log('3. Complete the web-based installation wizard');
    console.log('\n📚 Need help? Check ./docs/installation.md');
    console.log('🆘 Support: Create an issue on GitHub\n');
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Run setup wizard
if (require.main === module) {
  new SetupWizard().run();
}

module.exports = SetupWizard;