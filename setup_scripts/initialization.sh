# Цвета.
COLOR_RED="\e[31m"
COLOR_GREEN="\e[32m"
COLOR_YELLOW="\e[33m"
ENDCOLOR="\e[0m"

echo -e "> ${COLOR_YELLOW}Запуск...${ENDCOLOR}"

# Проверяем зависимости...
bash setup_scripts/dependency_check.sh
if [[ $? -eq 1 ]]; then exit; fi

echo -e "> ${COLOR_YELLOW}Устанавливаю npm-модули...${ENDCOLOR}"
npm i 

echo -e "> ${COLOR_YELLOW}Компилирую TypeScript файлы...${ENDCOLOR}"
npm run build

echo -e "> ${COLOR_YELLOW}Создаю .env${ENDCOLOR}"
npm run createEnv

echo -e "> ${COLOR_GREEN}Запускаю run_setup.js...${ENDCOLOR}"
npm run setup