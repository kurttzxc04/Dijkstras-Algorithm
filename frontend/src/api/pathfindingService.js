/**
 * Code Execution Service
 * 
 * Handles all code execution requests to the backend.
 * This service layer abstracts away API details from UI components.
 * 
 * Components should import functions from this file, not from api.js
 * 
 * Example:
 *   import { executeCppCode } from '../api/pathfindingService';
 *   const result = await executeCppCode(codeString);
 */

import { post } from './api';

/**
 * Execute C++ code on the backend
 * 
 * @param {string} code - C++ source code to execute
 * @returns {Promise<Object>} Execution result with structure:
 *   {
 *     status: 'success' | 'error',
 *     stdout: string,
 *     stderr: string,
 *     message: string
 *   }
 * @throws {Error} If the request fails (network error, timeout, etc.)
 */
export async function executeCppCode(code) {
  if (!code || typeof code !== 'string') {
    throw new Error('Code must be a non-empty string');
  }

  return post('/api/cpp', { code });
}

/**
 * Execute Java code on the backend
 * 
 * @param {string} code - Java source code to execute
 * @returns {Promise<Object>} Execution result
 * @throws {Error} If the request fails
 */
export async function executeJavaCode(code) {
  if (!code || typeof code !== 'string') {
    throw new Error('Code must be a non-empty string');
  }

  return post('/api/java', { code });
}

/**
 * Execute JavaScript code on the backend
 * 
 * @param {string} code - JavaScript source code to execute
 * @returns {Promise<Object>} Execution result
 * @throws {Error} If the request fails
 */
export async function executeJavaScriptCode(code) {
  if (!code || typeof code !== 'string') {
    throw new Error('Code must be a non-empty string');
  }

  return post('/api/javascript', { code });
}

/**
 * Execute code for the selected language
 * 
 * Convenience function that dispatches to the correct executor
 * 
 * @param {string} language - One of: 'cpp', 'java', 'javascript'
 * @param {string} code - Source code to execute
 * @returns {Promise<Object>} Execution result
 * @throws {Error} If language is unsupported or request fails
 */
export async function executeCode(language, code) {
  switch (language.toLowerCase()) {
    case 'cpp':
    case 'c++':
      return executeCppCode(code);
    case 'java':
      return executeJavaCode(code);
    case 'javascript':
    case 'js':
      return executeJavaScriptCode(code);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

export default {
  executeCppCode,
  executeJavaCode,
  executeJavaScriptCode,
  executeCode,
};
