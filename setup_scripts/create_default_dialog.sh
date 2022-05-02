# Цвета.
COLOR_RED="\e[31m"
COLOR_YELLOW="\e[33m"
COLOR_GREEN="\e[32m"
ENDCOLOR="\e[0m"

if [ $NO_COLOR ]; then
  COLOR_RED=""
  COLOR_YELLOW=""
  COLOR_GREEN=""
  ENDCOLOR=""
fi

if [[ "$#" -ne 1 ]]; then
  echo -e ">>> ${COLOR_YELLOW}Пожалуйста, укажите название файла (без окончания)${ENDCOLOR}"
  echo -e "Пример: ${COLOR_YELLOW}npm run createDefaultDialog welcome${ENDCOLOR}"
  echo -e "Пример №2: ${COLOR_YELLOW}npm run createDefaultDialog ready/welcome${ENDCOLOR} (У вас должна быть создана папка ready)"
  exit 1
fi

FILE_PATH="src/contents/$1.dialogues.ts"
if /usr/bin/touch $FILE_PATH; then
  echo -e "> ${COLOR_GREEN}Создан ${FILE_PATH}${END_COLOR}"
  echo "/**" >> $FILE_PATH
  echo " * Укажите описание!" >> $FILE_PATH
  echo " */" >> $FILE_PATH
  echo "const dialogues = [" >> $FILE_PATH
  echo "  'Кря.'," >> $FILE_PATH
  echo "]" >> $FILE_PATH
  echo "" >> $FILE_PATH
  echo "export default dialogues" >> $FILE_PATH

  echo -e ">>> ${COLOR_GREEN}Запись завершена!${END_COLOR}"
else 
  echo -e "${COLOR_RED}Произошла ошибка при создании файла! Проверьте, что вы правильно указали путь.${ENDCOLOR}"
fi