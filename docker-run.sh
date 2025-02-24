#!/bin/bash
set -e

echo "Checking Database for Migrations..."

#cache the migration status in FLAG_MIGRATED empty file
if [ -e FLAG_MIGRATED ]; then
    echo "Database Already Migrated"
    echo "Skipping Migration..."
else
    echo "Migrating Database..."
    echo "  This may take a minute..."
    echo "  Installing Needed Packages..."
    npm install drizzle-kit drizzle-orm
    echo "  Running Migrations..."
    npm run db:migrate & PID=$!
    wait $PID
    echo "  Migration Complete"
    echo "  Cleaning Up..."
    npm uninstall drizzle-kit # someparts of drizzle-orm is needed for the server to run
    echo "      Package Uninstalled..."
    rm -rf src/server/db/migrations
    rm -rf drizzle.config.ts
    echo "      Migration Files Removed..."
    touch ./FLAG_MIGRATED
fi

echo "\n Starting Server..."
node server.js & PID=$!

wait $PID