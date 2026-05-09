#!/usr/bin/env node

/**
 * EMS Integration Diagnostic Tool
 * Tests database, backend, and frontend connectivity
 * 
 * Usage: node test_integration.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('');
  log(`╔${'═'.repeat(60)}╗`, 'cyan');
  log(`║ ${title.padEnd(58)} ║`, 'cyan');
  log(`╚${'═'.repeat(60)}╝`, 'cyan');
}

async function testDatabaseConnection() {
  section('DATABASE CONNECTION TEST');
  
  try {
    const pool = new Pool({
      user: process.env.DB_USER,
      password: String(process.env.DB_PASSWORD || ''),
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME,
    });

    const result = await pool.query('SELECT NOW()');
    log(`✅ Database Connection Successful`, 'green');
    log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`, 'green');
    log(`   Database: ${process.env.DB_NAME}`, 'green');
    log(`   Timestamp: ${result.rows[0].now}`, 'green');

    // Test table existence
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    log(`\n📊 Tables Found: ${tablesResult.rows.length}`, 'blue');
    const tableNames = tablesResult.rows.map(r => r.table_name);
    tableNames.forEach(name => log(`   • ${name}`, 'blue'));

    await pool.end();
    return true;
  } catch (error) {
    log(`❌ Database Connection Failed`, 'red');
    log(`   Error: ${error.message}`, 'red');
    log(`   Make sure PostgreSQL is running and credentials are correct`, 'yellow');
    return false;
  }
}

async function testBackendConnection() {
  section('BACKEND API CONNECTION TEST');
  
  try {
    const url = 'http://localhost:5000/api/health';
    log(`Attempting connection to: ${url}`, 'blue');
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      log(`✅ Backend API Connection Successful`, 'green');
      log(`   Status: ${response.status}`, 'green');
      log(`   Response: ${JSON.stringify(data, null, 2)}`, 'green');
      return true;
    } else {
      log(`⚠️  Backend responded but with error status: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Backend API Connection Failed`, 'red');
    log(`   Error: ${error.message}`, 'red');
    log(`   Make sure backend is running: npm run dev`, 'yellow');
    log(`   Backend should be at: http://localhost:5000`, 'yellow');
    return false;
  }
}

async function testEnvironmentVariables() {
  section('ENVIRONMENT VARIABLES CHECK');
  
  const required = [
    'DB_USER',
    'DB_PASSWORD',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'PORT',
    'NODE_ENV',
    'JWT_SECRET',
  ];

  const optional = ['CORS_ORIGIN'];

  let allGood = true;

  log('Required Variables:', 'blue');
  for (const varName of required) {
    const value = process.env[varName];
    if (value) {
      const display = varName === 'DB_PASSWORD' ? '***' : value;
      log(`   ✅ ${varName.padEnd(15)} = ${display}`, 'green');
    } else {
      log(`   ❌ ${varName.padEnd(15)} = MISSING`, 'red');
      allGood = false;
    }
  }

  log('\nOptional Variables:', 'blue');
  for (const varName of optional) {
    const value = process.env[varName];
    if (value) {
      log(`   ✅ ${varName.padEnd(15)} = ${value}`, 'green');
    } else {
      log(`   ℹ️  ${varName.padEnd(15)} = (not set)`, 'yellow');
    }
  }

  return allGood;
}

async function testAPIEndpoints() {
  section('API ENDPOINTS TEST');
  
  const endpoints = [
    { method: 'GET', path: '/', description: 'Root API' },
    { method: 'GET', path: '/health', description: 'Health Check' },
    { method: 'GET', path: '/events', description: 'List Events' },
  ];

  log('Testing common endpoints:', 'blue');
  
  for (const endpoint of endpoints) {
    try {
      const url = `http://localhost:5000/api${endpoint.path}`;
      const response = await fetch(url);
      const status = response.ok ? `${response.status} OK` : `${response.status} ${response.statusText}`;
      const color = response.ok ? 'green' : 'yellow';
      log(`   ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(15)} → ${status} (${endpoint.description})`, color);
    } catch (error) {
      log(`   ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(15)} → ❌ ${error.message}`, 'red');
    }
  }
}

async function generateReport() {
  section('EMS INTEGRATION DIAGNOSTIC');
  log(`Generated: ${new Date().toISOString()}`, 'blue');
  
  const envOk = await testEnvironmentVariables();
  const dbOk = await testDatabaseConnection();
  const backendOk = await testBackendConnection();
  
  if (backendOk) {
    await testAPIEndpoints();
  }

  section('SUMMARY');
  
  log(`Environment Variables: ${envOk ? '✅ OK' : '❌ FAILED'}`, envOk ? 'green' : 'red');
  log(`Database Connection:   ${dbOk ? '✅ OK' : '❌ FAILED'}`, dbOk ? 'green' : 'red');
  log(`Backend API Server:    ${backendOk ? '✅ OK' : '❌ FAILED'}`, backendOk ? 'green' : 'red');

  section('NEXT STEPS');
  
  if (!envOk) {
    log('1. Update .env file with missing variables', 'yellow');
  }
  
  if (!dbOk) {
    log('1. Start PostgreSQL service', 'yellow');
    log('2. Verify database exists: eventsystem', 'yellow');
    log('3. Check .env credentials', 'yellow');
  }
  
  if (!backendOk) {
    log('1. Navigate to EMS-Backend directory', 'yellow');
    log('2. Install dependencies: npm install', 'yellow');
    log('3. Start backend: npm run dev', 'yellow');
  }

  if (envOk && dbOk && backendOk) {
    log('✨ All systems operational! Start frontend with: npm run dev', 'green');
  }

  console.log('');
}

generateReport().catch(console.error);
