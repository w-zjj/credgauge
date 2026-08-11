#!/usr/bin/env node

import { version } from "./index.js";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(`credgauge v${version}`);
  process.exit(0);
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`credgauge - data visualization dashboard CLI

Usage:
  credgauge [options]

Options:
  -v, --version    show version
  -h, --help       show help
`);
  process.exit(0);
}

console.log("credgauge: no command given. Run with --help.");
