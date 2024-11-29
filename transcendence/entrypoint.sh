#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Run migrations for 'accounts' and 'pong' apps
python3 manage.py makemigrations Pong
python3 manage.py makemigrations accounts
python3 manage.py migrate

# Execute the command passed as arguments (from CMD)
exec "$@"
