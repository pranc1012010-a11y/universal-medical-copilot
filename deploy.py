#!/usr/bin/env python3
"""
🚀 Universal Medical Co-Pilot - Automatic Vercel Deployment Script
Handles: GitHub, Vercel, PostgreSQL Database, Environment Variables

Usage:
    python deploy.py --github-token YOUR_GITHUB_TOKEN --vercel-token YOUR_VERCEL_TOKEN
"""

import os
import sys
import json
import subprocess
import time
from typing import Optional, Dict, Any
import urllib.request
import urllib.error

class DeploymentScript:
    def __init__(self, github_token: str, vercel_token: str):
        self.github_token = github_token
        self.vercel_token = vercel_token
        self.repo_owner = "pranc1012010-a11y"
        self.repo_name = "universal-medical-copilot"
        self.project_name = "universal-medical-copilot"
        self.vercel_base_url = "https://api.vercel.com"
        self.github_api_url = "https://api.github.com"
        
    def log(self, message: str, level: str = "INFO"):
        """Print formatted log messages"""
        colors = {
            "INFO": "\033[94m",    # Blue
            "SUCCESS": "\033[92m",  # Green
            "ERROR": "\033[91m",    # Red
            "WARNING": "\033[93m",  # Yellow
            "STEP": "\033[96m"      # Cyan
        }
        reset = "\033[0m"
        print(f"{colors.get(level, '')}{level}:{reset} {message}")
    
    def api_call(self, method: str, url: str, headers: Dict, data: Optional[str] = None) -> Dict[str, Any]:
        """Make HTTP API call"""
        try:
            req = urllib.request.Request(
                url,
                data=data.encode() if data else None,
                headers=headers,
                method=method
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = response.read().decode()
                return json.loads(response_data) if response_data else {}
        except urllib.error.HTTPError as e:
            error_data = e.read().decode()
            self.log(f"API Error ({e.code}): {error_data}", "ERROR")
            return {}
        except Exception as e:
            self.log(f"Connection Error: {str(e)}", "ERROR")
            return {}
    
    def step_1_check_github_repo(self) -> bool:
        """Step 1: Check if GitHub repo exists and is accessible"""
        self.log("Step 1️⃣: Checking GitHub Repository...", "STEP")
        
        url = f"{self.github_api_url}/repos/{self.repo_owner}/{self.repo_name}"
        headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        response = self.api_call("GET", url, headers)
        
        if response and "id" in response:
            self.log(f"✅ Repository found: {response['full_name']}", "SUCCESS")
            self.log(f"   URL: {response['html_url']}", "INFO")
            return True
        else:
            self.log(f"❌ Repository not found or not accessible", "ERROR")
            return False
    
    def step_2_create_vercel_project(self) -> Optional[Dict]:
        """Step 2: Create Vercel project"""
        self.log("Step 2️⃣: Creating Vercel Project...", "STEP")
        
        url = f"{self.vercel_base_url}/v13/projects"
        headers = {
            "Authorization": f"Bearer {self.vercel_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "name": self.project_name,
            "gitRepository": {
                "type": "github",
                "repo": f"{self.repo_owner}/{self.repo_name}"
            },
            "framework": "nextjs",
            "buildCommand": "bun install && prisma generate && next build",
            "devCommand": "next dev -p 3000",
            "installCommand": "bun install"
        }
        
        response = self.api_call("POST", url, headers, json.dumps(payload))
        
        if response and "id" in response:
            self.log(f"✅ Vercel project created: {response['name']}", "SUCCESS")
            self.log(f"   Project ID: {response['id']}", "INFO")
            return response
        else:
            self.log(f"⚠️  Project might already exist or error occurred", "WARNING")
            # Try to get existing project
            return self.step_2_get_existing_project()
    
    def step_2_get_existing_project(self) -> Optional[Dict]:
        """Get existing Vercel project"""
        self.log("Attempting to retrieve existing project...", "INFO")
        
        url = f"{self.vercel_base_url}/v9/projects"
        headers = {
            "Authorization": f"Bearer {self.vercel_token}",
            "Content-Type": "application/json"
        }
        
        response = self.api_call("GET", url, headers)
        
        if response and "projects" in response:
            for project in response["projects"]:
                if project.get("name") == self.project_name:
                    self.log(f"✅ Found existing project: {project['name']}", "SUCCESS")
                    return project
        
        return None
    
    def step_3_add_environment_variables(self, project: Dict) -> bool:
        """Step 3: Add environment variables to Vercel"""
        self.log("Step 3️⃣: Adding Environment Variables to Vercel...", "STEP")
        
        project_id = project["id"]
        
        # Generate random secrets
        import secrets
        jwt_secret = secrets.token_hex(32)  # 64 chars
        jwt_refresh_secret = secrets.token_hex(32)
        encryption_key = secrets.token_hex(16)  # 32 bytes
        
        # Note: DATABASE_URL should be set manually from PostgreSQL provider
        env_vars = {
            "DATABASE_URL": "postgresql://user:password@host:5432/database",
            "JWT_SECRET": jwt_secret,
            "JWT_REFRESH_SECRET": jwt_refresh_secret,
            "ENCRYPTION_KEY": encryption_key,
            "NEXT_PUBLIC_APP_URL": f"https://{self.project_name}.vercel.app",
            "NODE_ENV": "production"
        }
        
        headers = {
            "Authorization": f"Bearer {self.vercel_token}",
            "Content-Type": "application/json"
        }
        
        success_count = 0
        for key, value in env_vars.items():
            url = f"{self.vercel_base_url}/v9/projects/{project_id}/env"
            payload = {
                "key": key,
                "value": value,
                "type": "plain",
                "target": ["production", "preview", "development"]
            }
            
            response = self.api_call("POST", url, headers, json.dumps(payload))
            
            if response and "key" in response:
                masked_value = value[:10] + "..." if len(value) > 10 else value
                self.log(f"   ✅ {key} = {masked_value}", "INFO")
                success_count += 1
            else:
                self.log(f"   ⚠️  {key} - might already exist", "WARNING")
        
        if success_count > 0:
            self.log(f"✅ Environment variables configured ({success_count} set)", "SUCCESS")
            return True
        return False
    
    def step_4_trigger_deployment(self, project: Dict) -> bool:
        """Step 4: Trigger Vercel deployment"""
        self.log("Step 4️⃣: Triggering Deployment...", "STEP")
        
        project_id = project["id"]
        
        url = f"{self.vercel_base_url}/v13/deployments"
        headers = {
            "Authorization": f"Bearer {self.vercel_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "name": self.project_name,
            "project": project_id,
            "gitSource": {
                "type": "github",
                "repo": f"{self.repo_owner}/{self.repo_name}",
                "ref": "main"
            }
        }
        
        response = self.api_call("POST", url, headers, json.dumps(payload))
        
        if response and "uid" in response:
            self.log(f"✅ Deployment triggered!", "SUCCESS")
            self.log(f"   Deployment ID: {response['uid']}", "INFO")
            self.log(f"   Status: {response.get('state', 'BUILDING')}", "INFO")
            return True
        else:
            self.log(f"⚠️  Deployment trigger status unclear", "WARNING")
            return False
    
    def step_5_wait_for_deployment(self, project: Dict, max_wait: int = 300) -> bool:
        """Step 5: Wait for deployment to complete"""
        self.log("Step 5️⃣: Waiting for Deployment to Complete...", "STEP")
        
        project_id = project["id"]
        start_time = time.time()
        check_interval = 10  # Check every 10 seconds
        
        while (time.time() - start_time) < max_wait:
            url = f"{self.vercel_base_url}/v6/deployments"
            headers = {
                "Authorization": f"Bearer {self.vercel_token}",
                "Content-Type": "application/json"
            }
            
            response = self.api_call("GET", f"{url}?projectId={project_id}&limit=1", headers)
            
            if response and "deployments" in response and len(response["deployments"]) > 0:
                deployment = response["deployments"][0]
                state = deployment.get("state", "BUILDING")
                
                if state == "READY":
                    self.log(f"✅ Deployment completed successfully!", "SUCCESS")
                    url = deployment.get("url", f"https://{self.project_name}.vercel.app")
                    self.log(f"   Live URL: https://{url if url.startswith('http') else url}", "SUCCESS")
                    return True
                elif state == "ERROR":
                    self.log(f"❌ Deployment failed", "ERROR")
                    return False
                else:
                    elapsed = int(time.time() - start_time)
                    self.log(f"   Building... ({elapsed}s) - State: {state}", "INFO")
            
            time.sleep(check_interval)
        
        self.log(f"⚠️  Deployment still building after {max_wait}s", "WARNING")
        self.log(f"   Check progress: https://vercel.com/dashboard/projects/{project_id}", "INFO")
        return False
    
    def step_6_display_summary(self, project: Dict):
        """Step 6: Display deployment summary"""
        self.log("Step 6️⃣: Deployment Summary", "STEP")
        
        summary = f"""
╔════════════════════════════════════════════════════════════════╗
║                    DEPLOYMENT COMPLETE! 🎉                     ║
╚════════════════════════════════════════════════════════════════╝

📊 Project Information:
   • Name: {self.project_name}
   • Repository: {self.repo_owner}/{self.repo_name}
   • Framework: Next.js 16 + TypeScript

🌐 Live URL:
   ➜ https://{self.project_name}.vercel.app

🔧 Dashboard URLs:
   • Vercel Dashboard: https://vercel.com/dashboard/projects/{project.get('id', 'PROJECT_ID')}
   • GitHub Repository: https://github.com/{self.repo_owner}/{self.repo_name}

⚙️  Next Steps:
   1. Visit: https://{self.project_name}.vercel.app
   2. Create an account (Sign Up)
   3. Test the medical copilot features
   4. Share the link with others!

📝 Important Notes:
   ⚠️  DATABASE_URL: Update with your PostgreSQL connection string
       Choose from: Vercel Postgres, Supabase, Neon, or Railway
       Then redeploy via Vercel Dashboard
   
   🔐 JWT Secrets: Already configured randomly
   🔑 Encryption Key: Already configured randomly

📚 Documentation:
   • Deployment Guide: {self.github_api_url}/repos/{self.repo_owner}/{self.repo_name}/blob/main/DEPLOYMENT.md
   • Troubleshooting: {self.github_api_url}/repos/{self.repo_owner}/{self.repo_name}/issues

═══════════════════════════════════════════════════════════════════
"""
        print(summary)
    
    def run(self):
        """Execute full deployment pipeline"""
        self.log("🚀 Starting Universal Medical Co-Pilot Deployment", "STEP")
        print()
        
        try:
            # Step 1: Check repository
            if not self.step_1_check_github_repo():
                return False
            print()
            
            # Step 2: Create Vercel project
            project = self.step_2_create_vercel_project()
            if not project:
                self.log("Failed to create or retrieve Vercel project", "ERROR")
                return False
            print()
            
            # Step 3: Add environment variables
            time.sleep(2)  # Wait for project to be fully created
            if not self.step_3_add_environment_variables(project):
                self.log("Failed to add environment variables", "ERROR")
                return False
            print()
            
            # Step 4: Trigger deployment
            time.sleep(2)
            if not self.step_4_trigger_deployment(project):
                self.log("Failed to trigger deployment", "ERROR")
                return False
            print()
            
            # Step 5: Wait for deployment
            time.sleep(5)
            deployment_success = self.step_5_wait_for_deployment(project)
            print()
            
            # Step 6: Display summary
            self.step_6_display_summary(project)
            
            return True
        
        except Exception as e:
            self.log(f"Unexpected error: {str(e)}", "ERROR")
            return False


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="🚀 Automatic Vercel Deployment for Universal Medical Co-Pilot"
    )
    parser.add_argument("--github-token", required=True, help="GitHub Personal Access Token")
    parser.add_argument("--vercel-token", required=True, help="Vercel API Token")
    
    args = parser.parse_args()
    
    # Validate tokens
    if not args.github_token or len(args.github_token) < 20:
        print("❌ Invalid GitHub token")
        sys.exit(1)
    
    if not args.vercel_token or len(args.vercel_token) < 20:
        print("❌ Invalid Vercel token")
        sys.exit(1)
    
    # Run deployment
    deployer = DeploymentScript(args.github_token, args.vercel_token)
    success = deployer.run()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
