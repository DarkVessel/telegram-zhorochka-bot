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

# Массив с зависимостями, которых нет в системе.
declare -a missingDependencies

# Функция для проверки зависимости.
# 1 аргумент название команды, 2 аргумент название пакета (любое).
function check {
    if ! command -v $1 $> /dev/null; then
        missingDependencies+=("$2")
    fi
}

echo -e "> ${COLOR_YELLOW}Проверяю зависимости...${ENDCOLOR}"
check "node" "nodejs"
check "npm" "npm"
check "git" "git"

# Если количество элементов в массиве не равняется нулю. 
if [ ${#missingDependencies[@]} -gt 0 ]; then
  echo -e "${COLOR_RED}У вас не установлены пакеты:${ENDCOLOR} ${missingDependencies[@]}"
  echo -e "${COLOR_RED}Установите и выполните команду заново.${ENDCOLOR}"
  exit 1
fi

echo -e "${COLOR_GREEN}Всё в порядке.${ENDCOLOR}"

exit 0