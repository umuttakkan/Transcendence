# Variables
VENV_DIR = venv
PYTHON = $(VENV_DIR)/bin/python
PIP = $(VENV_DIR)/bin/pip
DJANGO_MANAGE = $(PYTHON) transcendence/manage.py

# Create virtual environment
$(VENV_DIR)/bin/activate: requirements.txt
	python3 -m venv $(VENV_DIR)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

# Run server
runserver: $(VENV_DIR)/bin/activate
	$(DJANGO_MANAGE) runserver

# Run migrations
migrate: $(VENV_DIR)/bin/activate
	$(DJANGO_MANAGE) makemigrations
	$(DJANGO_MANAGE) migrate

# Collect static files
collectstatic: $(VENV_DIR)/bin/activate
	$(DJANGO_MANAGE) collectstatic --noinput

# Run tests
test: $(VENV_DIR)/bin/activate
	$(DJANGO_MANAGE) test

# Clean up .pyc files
clean:
	find . -name "*.pyc" -exec rm -f {} \;
	find . -name "__pycache__" -exec rm -rf {} \;

# Clean up virtual environment
fclean: clean
	rm -rf $(VENV_DIR)

.PHONY: runserver migrate makemigrations install collectstatic test clean clean-venv
