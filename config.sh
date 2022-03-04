# Цвета.
COLOR_RED="\e[31m"
COLOR_GREEN="\e[32m"
COLOR_YELLOW="\e[33m"
ENDCOLOR="\e[0m"

echo -e "> ${COLOR_YELLOW}Запуск...${ENDCOLOR}"

declare -a missingDependencies

function check {
    if ! command -v $1 $> /dev/null; then
        missingDependencies+=("$2")
    fi
}

echo -e "> ${COLOR_YELLOW}Проверяю зависимости...${ENDCOLOR}"
check "node" "nodejs"
check "npm" "npm"

if [ ${#missingDependencies[@]} -gt 0 ]; then
  echo -e "${COLOR_RED}У вас не установлены пакеты:${ENDCOLOR} ${missingDependencies[@]}"
  echo -e "${COLOR_RED}Установите и возвращайтесь.${ENDCOLOR}"
  exit
fi
echo -e "> ${COLOR_GREEN}Всё в порядке...${ENDCOLOR}"
echo -e "> ${COLOR_YELLOW}Устанавливаю npm-модули...${ENDCOLOR}"
npm i 

echo -e "> ${COLOR_YELLOW}Проверяю наличие TypeScript компилятора...${ENDCOLOR}"

if ! command -v tsc &> /dev/null; then
  echo -e "${COLOR_GREEN}Отсутствует tsc, устанавливаю...${ENDCOLOR}"
  npm i typescript -g
fi

echo -e "> ${COLOR_YELLOW}Компилирую TypeScript файлы...${ENDCOLOR}"
tsc --watch false

echo -e "> ${COLOR_YELLOW}Создаю необходимые файлы...${ENDCOLOR}"
echo "BOT_TOKEN=" >> .env
echo "{}" >> src/config.json
echo "Создан .env и src/config.json"

echo -e "> ${COLOR_GREEN}Запускаю settigns.js...${ENDCOLOR}"
npm run settings