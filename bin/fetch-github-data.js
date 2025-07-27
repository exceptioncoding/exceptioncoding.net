#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * GitHub Data Fetcher
 * 
 * This script fetches GitHub profile data including:
 * - User profile information
 * - Public repositories
 * - Pinned repositories (scraped from profile HTML)
 * 
 * Usage: node bin/fetch-github-data.js [username]
 */

const USERNAME = process.argv[2] || 'exceptioncoding';
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'github-data.json');

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_PROFILE_URL = `https://github.com/${USERNAME}`;

// Request headers for GitHub API
const getHeaders = () => {
  const headers = {
    'User-Agent': 'ExceptionCoding-Portfolio/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };
  
  // Add GitHub token if available (optional but recommended for higher rate limits)
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  
  return headers;
};

/**
 * Fetch data from GitHub API
 */
async function fetchGitHubAPI(endpoint) {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  console.log(`🔗 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, { headers: getHeaders() });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Fetch user profile data
 */
async function fetchUserProfile() {
  console.log(`👤 Fetching user profile for: ${USERNAME}`);
  return await fetchGitHubAPI(`/users/${USERNAME}`);
}

/**
 * Fetch all public repositories
 */
async function fetchPublicRepositories() {
  console.log(`📦 Fetching public repositories for: ${USERNAME}`);
  
  let allRepos = [];
  let page = 1;
  const perPage = 100;
  
  while (true) {
    const repos = await fetchGitHubAPI(`/users/${USERNAME}/repos?page=${page}&per_page=${perPage}&sort=updated&direction=desc`);
    
    if (repos.length === 0) {
      break;
    }
    
    allRepos = allRepos.concat(repos);
    console.log(`📄 Fetched page ${page}: ${repos.length} repositories`);
    
    if (repos.length < perPage) {
      break;
    }
    
    page++;
  }
  
  console.log(`🎯 Total repositories fetched: ${allRepos.length}`);
  return allRepos;
}

/**
 * Scrape pinned repositories from GitHub profile HTML
 */
async function fetchPinnedRepositories() {
  console.log(`📌 Scraping pinned repositories from: ${GITHUB_PROFILE_URL}`);
  
  try {
    const response = await fetch(GITHUB_PROFILE_URL, {
      headers: {
        'User-Agent': 'ExceptionCoding-Portfolio/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch profile page: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract pinned repository data from HTML
    const pinnedRepos = [];
    
    // Look for pinned repository cards using regex patterns
    // GitHub uses data attributes and specific class patterns for pinned repos
    const pinnedRepoPattern = /<div[^>]*class="[^"]*pinned-item-list-item[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    const repoNamePattern = /<a[^>]*href="\/[^\/]+\/([^"\/]+)"[^>]*class="[^"]*text-bold[^"]*"[^>]*>/g;
    const repoDescPattern = /<p[^>]*class="[^"]*pinned-item-desc[^"]*"[^>]*>([\s\S]*?)<\/p>/g;
    const repoLanguagePattern = /<span[^>]*class="[^"]*repo-language-color[^"]*"[^>]*style="[^"]*background-color:\s*([^"]+)"[^>]*><\/span>[^<]*<span[^>]*>([^<]+)<\/span>/g;
    
    let pinnedMatch;
    while ((pinnedMatch = pinnedRepoPattern.exec(html)) !== null) {
      const pinnedHTML = pinnedMatch[1];
      
      // Extract repository name
      const nameMatch = repoNamePattern.exec(pinnedHTML);
      if (!nameMatch) continue;
      
      const repoName = nameMatch[1];
      
      // Reset regex lastIndex for next searches within this pinned repo
      repoDescPattern.lastIndex = 0;
      repoLanguagePattern.lastIndex = 0;
      
      // Extract description
      const descMatch = repoDescPattern.exec(pinnedHTML);
      const description = descMatch ? descMatch[1].trim().replace(/<[^>]*>/g, '') : '';
      
      // Extract language
      const langMatch = repoLanguagePattern.exec(pinnedHTML);
      const language = langMatch ? langMatch[2].trim() : null;
      
      pinnedRepos.push({
        name: repoName,
        description: description,
        language: language,
        html_url: `https://github.com/${USERNAME}/${repoName}`
      });
      
      // Reset regex for next iteration
      repoNamePattern.lastIndex = 0;
    }
    
    console.log(`🎯 Found ${pinnedRepos.length} pinned repositories:`, pinnedRepos.map(r => r.name));
    return pinnedRepos;
    
  } catch (error) {
    console.warn(`⚠️ Failed to scrape pinned repositories:`, error.message);
    console.log(`💡 Continuing without pinned repository data...`);
    return [];
  }
}

/**
 * Process and transform repository data - minimal data for security
 */
function processRepositoryData(repos, pinnedRepos = []) {
  console.log(`🔄 Processing ${repos.length} repositories...`);
  
  // Create a set of pinned repository names for quick lookup
  const pinnedNames = new Set(pinnedRepos.map(repo => repo.name.toLowerCase()));
  
  // Filter and transform repositories - only include essential fields used by the website
  const processedRepos = repos
    .filter(repo => !repo.fork && !repo.private) // Only non-fork public repos
    .map(repo => ({
      name: repo.name,
      description: repo.description || 'No description available',
      htmlUrl: repo.html_url,
      homepage: repo.homepage || null,
      language: repo.language,
      stargazersCount: repo.stargazers_count,
      topics: (repo.topics || []).slice(0, 5), // Limit topics to reduce data
      updatedAt: repo.updated_at,
      isPinned: pinnedNames.has(repo.name.toLowerCase())
    }))
    .sort((a, b) => {
      // Sort pinned repos first, then by stars, then by update date
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (b.stargazersCount !== a.stargazersCount) return b.stargazersCount - a.stargazersCount;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  
  const featuredRepos = processedRepos.filter(repo => repo.isPinned);
  
  console.log(`⭐ Featured repositories: ${featuredRepos.length}`);
  console.log(`📊 Total processed repositories: ${processedRepos.length}`);
  
  return { processedRepos, featuredRepos };
}

/**
 * Generate the final data structure - minimal data for security
 */
function generateGitHubData(user, repos, featuredRepos) {
  return {
    repositories: repos
  };
}

/**
 * Save data to JSON file
 */
async function saveData(data) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write data to file with pretty formatting
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`💾 Data saved to: ${OUTPUT_FILE}`);
    console.log(`📊 Summary:`);
    console.log(`   • Public repos: ${data.repositories.length}`);
    console.log(`   • Featured repos: ${data.repositories.filter(r => r.isPinned).length}`);
    
  } catch (error) {
    console.error(`❌ Failed to save data:`, error.message);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log(`🚀 Starting GitHub data fetch for: ${USERNAME}`);
  console.log(`📁 Output file: ${OUTPUT_FILE}`);
  
  if (process.env.GITHUB_TOKEN) {
    console.log(`🔑 Using GitHub token for authentication`);
  } else {
    console.log(`⚠️ No GitHub token found. Rate limits may apply.`);
    console.log(`💡 Set GITHUB_TOKEN environment variable for higher limits.`);
  }
  
  try {
    // Fetch all data in parallel for better performance
    console.log(`\n⏳ Fetching data from multiple sources...`);
    
    const [user, repos, pinnedRepos] = await Promise.all([
      fetchUserProfile(),
      fetchPublicRepositories(),
      fetchPinnedRepositories()
    ]);
    
    // Process repository data
    const { processedRepos, featuredRepos } = processRepositoryData(repos, pinnedRepos);
    
    // Generate final data structure
    const githubData = generateGitHubData(user, processedRepos, featuredRepos);
    
    // Save to file
    await saveData(githubData);
    
    console.log(`\n✅ GitHub data fetch completed successfully!`);
    
  } catch (error) {
    console.error(`\n❌ Failed to fetch GitHub data:`, error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  fetchUserProfile,
  fetchPublicRepositories,
  fetchPinnedRepositories,
  processRepositoryData,
  generateGitHubData
};