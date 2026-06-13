#!/usr/bin/env pwsh
# Sectors Tab Database Setup Script
# Run this script to set up the database for the Sectors Tab
#
# Prerequisites:
# - You have access to your Supabase project dashboard
# - OR you have direct database credentials
#
# Usage:
#   .\setup-sectors-db.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sectors Tab Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$migrationFile = "infra/supabase/migrations/create-country-sectors-table.sql"
$seedFile = "infra/supabase/seed-nigeria-sectors.sql"

# Check if files exist
if (-not (Test-Path $migrationFile)) {
    Write-Host "ERROR: Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $seedFile)) {
    Write-Host "ERROR: Seed file not found: $seedFile" -ForegroundColor Red
    exit 1
}

Write-Host "Found migration and seed files ✓" -ForegroundColor Green
Write-Host ""

# Display options
Write-Host "How would you like to apply the database changes?" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open Supabase SQL Editor (Recommended)" -ForegroundColor White
Write-Host "   - Opens your Supabase dashboard in browser" -ForegroundColor Gray
Write-Host "   - Copy/paste SQL files manually" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Display SQL to copy" -ForegroundColor White
Write-Host "   - Shows SQL content to copy manually" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Use direct Postgres connection" -ForegroundColor White
Write-Host "   - Requires database credentials" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Opening Supabase SQL Editor..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Instructions:" -ForegroundColor Yellow
        Write-Host "1. Log in to your Supabase dashboard" -ForegroundColor White
        Write-Host "2. Navigate to SQL Editor" -ForegroundColor White
        Write-Host "3. Create a new query" -ForegroundColor White
        Write-Host "4. Copy the migration SQL (shown below)" -ForegroundColor White
        Write-Host "5. Paste and click 'Run'" -ForegroundColor White
        Write-Host "6. Repeat with the seed SQL" -ForegroundColor White
        Write-Host ""
        
        # Open Supabase dashboard
        if ($env:NEXT_PUBLIC_SUPABASE_URL) {
            $projectUrl = $env:NEXT_PUBLIC_SUPABASE_URL -replace "\.supabase\.co.*", ""
            $projectRef = $projectUrl -replace "https://", ""
            $dashboardUrl = "https://supabase.com/dashboard/project/$projectRef/sql"
            Start-Process $dashboardUrl
            Write-Host "Opened: $dashboardUrl" -ForegroundColor Green
        } else {
            Write-Host "Could not find NEXT_PUBLIC_SUPABASE_URL in environment" -ForegroundColor Yellow
            Write-Host "Please navigate to: https://supabase.com/dashboard" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "Press Enter to display migration SQL..." -ForegroundColor Yellow
        Read-Host
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "MIGRATION SQL (create-country-sectors-table.sql)" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Get-Content $migrationFile | Write-Host -ForegroundColor White
        
        Write-Host ""
        Write-Host "Press Enter to display seed SQL..." -ForegroundColor Yellow
        Read-Host
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "SEED SQL (seed-nigeria-sectors.sql)" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Get-Content $seedFile | Write-Host -ForegroundColor White
        
        Write-Host ""
        Write-Host "Copy the SQL above and run it in your Supabase SQL Editor" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "MIGRATION SQL" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Get-Content $migrationFile | Write-Host -ForegroundColor White
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "SEED SQL" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Get-Content $seedFile | Write-Host -ForegroundColor White
    }
    
    "3" {
        Write-Host ""
        $dbHost = Read-Host "Database Host (e.g., db.xxx.supabase.co)"
        $dbName = Read-Host "Database Name (default: postgres)" 
        if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "postgres" }
        $dbUser = Read-Host "Database User (default: postgres)"
        if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }
        $dbPassword = Read-Host "Database Password" -AsSecureString
        
        # Convert secure string to plain text (for psql)
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
        $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        
        $connectionString = "postgresql://${dbUser}:${plainPassword}@${dbHost}:5432/${dbName}"
        
        Write-Host ""
        Write-Host "Applying migration..." -ForegroundColor Cyan
        
        try {
            $env:PGPASSWORD = $plainPassword
            psql -h $dbHost -U $dbUser -d $dbName -f $migrationFile
            
            Write-Host ""
            Write-Host "Migration applied successfully ✓" -ForegroundColor Green
            Write-Host ""
            Write-Host "Applying seed data..." -ForegroundColor Cyan
            
            psql -h $dbHost -U $dbUser -d $dbName -f $seedFile
            
            Write-Host ""
            Write-Host "Seed data applied successfully ✓" -ForegroundColor Green
            
        } catch {
            Write-Host ""
            Write-Host "ERROR: Failed to apply database changes" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
            Write-Host ""
            Write-Host "Please use Option 1 (Supabase Dashboard) instead" -ForegroundColor Yellow
            exit 1
        }
    }
    
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verify data was inserted:" -ForegroundColor Yellow
Write-Host "   SELECT sector_label, strength_score FROM souvera_country_sectors;" -ForegroundColor White
Write-Host ""
Write-Host "2. Start your dev server:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Navigate to:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/country/NGA?tab=sectors" -ForegroundColor White
Write-Host ""
Write-Host "You should see 5 sectors with executive intelligence! 🎉" -ForegroundColor Green
Write-Host ""
