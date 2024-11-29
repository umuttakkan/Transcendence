# Colors
DEF_COLOR = \033[0;39m
GREEN = \033[0;92m
BLUE = \033[0;94m
RED = \033[0;91m
WHITE = \033[0;97m

NAME = Transcendence

# Docker commands
up:
	@echo "$(BLUE)Starting $(NAME) containers...$(DEF_COLOR)"
	@mkdir -p ./data/PostgreSQL ./data/NginX
	@docker-compose -f docker-compose.yml up -d --build
	@echo "$(GREEN)Containers are up and running.$(DEF_COLOR)"

down:
	@echo "$(BLUE)Stopping $(NAME) containers...$(DEF_COLOR)"
	@docker-compose -f docker-compose.yml down
	@echo "$(RED)Containers stopped.$(DEF_COLOR)"

clean:
	@echo "$(RED)Removing containers, volumes, and orphans...$(DEF_COLOR)"
	@docker-compose -f docker-compose.yml down -v --remove-orphans
	@echo "$(RED)Removing unused Docker images...$(DEF_COLOR)"
	@docker rmi -f $$(docker images -q)
	@rm -rf ./data/PostgreSQL ./data/NginX
	@echo "$(GREEN)Clean completed.$(DEF_COLOR)"

# Check Docker status
status:
	@echo "$(BLUE)Checking running Docker containers...$(DEF_COLOR)"
	@docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
	@echo "$(GREEN)Docker status checked.$(DEF_COLOR)"

# Display Docker version and info
info:
	@echo "$(BLUE)Docker version:$(DEF_COLOR)"
	@docker version
	@echo "$(BLUE)Docker system information:$(DEF_COLOR)"
	@docker info

# Restart containers
restart:
	@echo "$(BLUE)Restarting $(NAME) containers...$(DEF_COLOR)"
	@make down
	@make up
	@echo "$(GREEN)Containers restarted successfully.$(DEF_COLOR)"
