#!/usr/bin/env node

/**
 * Version Synchronization Utility
 * Ensures package.json version matches algorithm version in config.ts
 */

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const rootDir = __dirname + '/..';
const packageJsonPath = join(rootDir, 'package.json');
const configPath = join(rootDir, 'src', 'config.ts');

/**
 * Extract algorithm version from config.ts
 */
function extractAlgorithmVersion() {
  const configContent = readFileSync(configPath, 'utf8');
  const versionMatch = configContent.match(/version:\s*['"]([^'"]+)['"],/);
  
  if (!versionMatch) {
    throw new Error('Could not find algorithm version in config.ts');
  }
  
  return versionMatch[1];
}

/**
 * Update package.json version
 */
function updatePackageVersion(newVersion) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = packageJson.version;
  
  if (oldVersion === newVersion) {
    console.log(`✅ Versions already in sync: ${newVersion}`);
    return false;
  }
  
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`📦 Updated package.json version: ${oldVersion} → ${newVersion}`);
  return true;
}

/**
 * Validate version format
 */
function validateVersion(version) {
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*))?(?:\+([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*))?$/;
  
  if (!semverRegex.test(version)) {
    throw new Error(`Invalid version format: ${version}. Must follow semantic versioning (e.g., 1.0.0)`);
  }
  
  return true;
}

/**
 * Main synchronization function
 */
function syncVersions() {
  try {
    console.log('🔄 Checking version synchronization...');
    
    const algorithmVersion = extractAlgorithmVersion();
    console.log(`🔬 Algorithm version: ${algorithmVersion}`);
    
    validateVersion(algorithmVersion);
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const packageVersion = packageJson.version;
    console.log(`📦 Package.json version: ${packageVersion}`);
    
    if (packageVersion === algorithmVersion) {
      console.log('✅ Versions are synchronized');
      return true;
    }
    
    console.log('⚠️  Version mismatch detected!');
    
    // Check if we should update package.json or algorithm version
    const args = process.argv.slice(2);
    const shouldFix = args.includes('--fix') || args.includes('-f');
    
    if (shouldFix) {
      updatePackageVersion(algorithmVersion);
      console.log('✅ Version synchronization complete');
      return true;
    } else {
      console.log('💡 To fix version mismatch, run: npm run version-sync -- --fix');
      console.log('💡 Or update algorithm version in src/config.ts manually');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Version synchronization failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const success = syncVersions();
  process.exit(success ? 0 : 1);
}

module.exports = { syncVersions, extractAlgorithmVersion, updatePackageVersion, validateVersion }; 