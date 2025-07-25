#!/usr/bin/env zx

import 'zx/globals'
import { dbExecute, declareLocalType, exitWithDbClose, loadEnv, testDbConnect } from './utils.mjs'

// 根据环境变量 process.env.DB_DRIVER 声明 type DB_DRIVER

// 数据库是否已经初始化（通过检测表 publicBookmarks 是否存在）
async function testDBInitialed() {
  let sql = ''
  if (process.env.DB_DRIVER === 'postgresql') {
    sql = `
        SELECT *
        FROM pg_catalog.pg_tables
        WHERE schemaname = 'public' AND tablename = 'publicBookmarks';`
    const res = await dbExecute(sql)
    return res.length === 1
  } else if (process.env.DB_DRIVER === 'sqlite') {
    sql = `
      SELECT name 
      FROM sqlite_master 
      WHERE type = 'table' 
      AND name = 'publicBookmarks';`
    const res = await dbExecute(sql)
    return res.rows.length === 1
  }
}

await loadEnv()

await declareLocalType()

const prefix = chalk.bold.cyan('DATABASE: ')
// echo(prefix + 'Start')

if (!(await testDbConnect())) {
  echo(chalk.red('❌ 数据库连接失败'))
  process.exit(1)
}

echo(prefix + chalk.green('✅ 数据库连接成功'))

try {
  const dbInitialed = await testDBInitialed()
  if (dbInitialed) {
    // echo(prefix + '已经初始化，跳过本次任务\n')
  } else {
    echo(prefix + '开始数据库初始化')
    await $`pnpm drizzle-kit generate`
    echo(prefix + chalk.green('✅ 已生成本地快照'))
    await $`pnpm drizzle-kit migrate`
    echo(prefix + chalk.green('✅ 数据库初始化成功'))
  }
  exitWithDbClose()
} catch (err) {
  console.log('\n\n\n========================================================================')
  echo(chalk.red(prefix + '数据库初始化失败'))
  console.error(err)
  console.log('========================================================================')
  echo(chalk.yellow('\n数据库初始化失败，请重试。'))
  exitWithDbClose(1)
}
