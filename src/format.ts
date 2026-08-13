import chalk from 'chalk';

export function printJson(data: unknown) {
  console.log(JSON.stringify(data, null, 2));
}

export function header(title: string) {
  console.log('\n' + chalk.bold.cyan('═'.repeat(60)));
  console.log(chalk.bold.cyan(`  ${title}`));
  console.log(chalk.bold.cyan('═'.repeat(60)));
}

export function kv(key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return;
  const v = typeof value === 'object' ? JSON.stringify(value) : String(value);
  console.log(`  ${chalk.dim(key.padEnd(22))} ${chalk.white(v)}`);
}

export function section(title: string) {
  console.log('\n' + chalk.bold.yellow(`▶ ${title}`));
}

export function listItem(label: string, detail?: string) {
  if (detail) {
    console.log(`  ${chalk.green('•')} ${label}  ${chalk.dim(detail)}`);
  } else {
    console.log(`  ${chalk.green('•')} ${label}`);
  }
}

export function error(msg: string) {
  console.error(chalk.red.bold('Error: ') + chalk.red(msg));
}

export function success(msg: string) {
  console.log(chalk.green('✓ ') + msg);
}

/** Pretty-print a generic Robtex-style object. */
export function prettyObject(obj: Record<string, unknown>, depth = 0) {
  const indent = '  '.repeat(depth);
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      console.log(`${indent}${chalk.dim(k)}:`);
      v.slice(0, 15).forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          console.log(`${indent}  [${i}]`);
          prettyObject(item as Record<string, unknown>, depth + 2);
        } else {
          console.log(`${indent}  ${chalk.green('•')} ${item}`);
        }
      });
      if (v.length > 15) console.log(`${indent}  ${chalk.dim(`… +${v.length - 15} more`)}`);
    } else if (typeof v === 'object') {
      console.log(`${indent}${chalk.dim(k)}:`);
      prettyObject(v as Record<string, unknown>, depth + 1);
    } else {
      console.log(`${indent}${chalk.dim(k.padEnd(20))} ${chalk.white(String(v))}`);
    }
  }
}
