# Цвета.
COLOR_RED="\e[31m"
COLOR_GREEN="\e[32m"
COLOR_YELLOW="\e[33m"
ENDCOLOR="\e[0m"

if [ $NO_COLOR ]; then
  COLOR_RED=""
  COLOR_YELLOW=""
  COLOR_GREEN=""
  ENDCOLOR=""
fi

# Проверяем зависимости...
bash setup_scripts/dependency_check.sh
if [[ $? -eq 1 ]]; then exit; fi

echo ""
echo -e "> ${COLOR_RED}ВНИМАНИЕ!! ВСЕ ВАШИ ИЗМЕНЕНИЯ В ПРОЕКТЕ БУДУТ УДАЛЕНЫ.${ENDCOLOR}"
echo -e "> ${COLOR_RED}СДЕЛАЙТЕ РЕЗЕРВНУЮ КОПИЮ И ТОЛЬКО ТОГДА ПРИСТУПАЙТЕ.${ENDCOLOR}"
read -p ">>> Продолжить? [Y/n]: " answer

if [ -z "$answer" ]; then
  echo -e ">>> ${COLOR_YELLOW}Укажите либо Y (yes) либо N (no)${ENDCOLOR}"
  exit 0
fi

if [[ "${answer,,}" = "y" ]] || [[ "${answer,,}" = "д" ]]; then
  echo ""
  echo -e "> ${COLOR_YELLOW}Сброс изменений...${ENDCOLOR}"
  echo "git reset HEAD --hard"
  git reset HEAD --hard

  echo ""
  echo -e "> ${COLOR_YELLOW}Обновляю клиент...${ENDCOLOR}"
  echo "git pull"
  git pull

  echo ""
  echo -e "> ${COLOR_YELLOW}Удаляю папки build и typings...${ENDCOLOR}"
  echo "npm run clear"
  npm run clear

  echo ""
  echo -e "< ${COLOR_YELLOW}Ставлю/обновляю модули...${ENDCOLOR}"
  echo "npm i"
  npm i 

  echo ""
  echo -e "> ${COLOR_YELLOW}Компилирую TypeScript файлы...${ENDCOLOR}"
  echo "npm run build"
  npm run build

  echo ""
  echo -e "> ${COLOR_YELLOW}Обновляю .env${ENDCOLOR}"
  echo "npm run createEnv"
  npm run createEnv

  echo ""
  echo -e "> ${COLOR_GREEN}Запускаю run_setup.js...${ENDCOLOR}"
  echo "npm run setup"
  npm run setup

  echo ""
  echo -e "> ${COLOR_GREEN}Успешно!${ENDCOLOR}" 
else
  echo -e "${COLOR_YELLOW}Воспринял ответ как \"нет\".${ENDCOLOR}"
fi
