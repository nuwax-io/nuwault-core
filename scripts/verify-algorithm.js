#!/usr/bin/env node
/**
 * Algorithm stability verification script.
 * Runs all predefined test vectors and compares expected vs actual output.
 * Exit code 0 = all match, exit code 1 = mismatch detected.
 *
 * Usage: npm run verify:algorithm
 */

import { PasswordGenerator, HashGenerator, ALGORITHM_TEST_VECTORS } from '../dist/index.js';

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const DIM    = '\x1b[2m';

const LINE = '─'.repeat(52);

function pad(label, width = 10) {
  return label.padEnd(width);
}

async function runVector(vector, index) {
  const { input, expectedOutput } = vector;

  const [hashResult, passwordResult] = await Promise.all([
    HashGenerator.generateHash({
      keywords: input.keywords,
      masterSalt: input.masterSalt ?? null
    }),
    PasswordGenerator.generatePassword({
      keywords: input.keywords,
      length: input.length,
      options: input.options,
      masterSalt: input.masterSalt
    })
  ]);

  const hashMatch   = hashResult.hash.startsWith(expectedOutput.hashPrefix);
  const passMatch   = passwordResult.password === expectedOutput.password;
  const allMatch    = hashMatch && passMatch;

  const keywordsStr = JSON.stringify(input.keywords);
  console.log(`\n${BOLD}Vector ${index + 1}:${RESET} ${CYAN}${keywordsStr}${RESET} → length ${input.length}`);
  console.log(LINE);

  console.log(`  ${pad('Expected')} : ${BOLD}${expectedOutput.password}${RESET}`);
  console.log(`  ${pad('Actual')}   : ${passMatch ? GREEN : RED}${BOLD}${passwordResult.password}${RESET}`);
  console.log(`  ${pad('Status')}   : ${passMatch ? `${GREEN}✓ MATCH${RESET}` : `${RED}✗ MISMATCH${RESET}`}`);

  console.log(`  ${DIM}${pad('Hash')}     : ${hashResult.hash.substring(0, 16)}...${RESET}`);
  console.log(`  ${DIM}${pad('Expected')} : ${expectedOutput.hashPrefix}...${RESET}`);
  console.log(`  ${DIM}${pad('Hash OK')}  : ${hashMatch ? '✓' : '✗'}${RESET}`);

  const diversity = passwordResult.metadata.characterDiversity;
  console.log(`  ${DIM}Diversity  : ${diversity.totalUniqueCharacters} unique chars, max rep ${diversity.maxRepetitions}, ratio ${diversity.diversityRatio}${RESET}`);

  return allMatch;
}

async function main() {
  console.log(`\n${BOLD}Nuwault Core — Algorithm Verification${RESET}`);
  console.log(`${'═'.repeat(52)}`);
  console.log(`${DIM}Algorithm version lock check against predefined test vectors.${RESET}`);

  const results = [];

  for (let i = 0; i < ALGORITHM_TEST_VECTORS.length; i++) {
    try {
      const ok = await runVector(ALGORITHM_TEST_VECTORS[i], i);
      results.push(ok);
    } catch (err) {
      console.log(`\n${RED}Vector ${i + 1} threw an error: ${err.message}${RESET}`);
      results.push(false);
    }
  }

  const passed = results.filter(Boolean).length;
  const total  = results.length;
  const allOk  = passed === total;

  console.log(`\n${'═'.repeat(52)}`);

  if (allOk) {
    console.log(`${GREEN}${BOLD}✅  All ${total} vectors match — algorithm is stable.${RESET}`);
  } else {
    console.log(`${RED}${BOLD}❌  ${total - passed}/${total} vector(s) failed — algorithm output has changed!${RESET}`);
    console.log(`${YELLOW}    Update ALGORITHM_TEST_VECTORS in config.ts if this was intentional.${RESET}`);
  }

  console.log('');
  process.exit(allOk ? 0 : 1);
}

main();
