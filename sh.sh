#!/bin/bash

# Скрипт для объединения содержимого всех файлов в текущей папке и подпапках
# Отображает относительные пути к файлам

# Выходной файл
OUTPUT_FILE="all_files_content.txt"
# Получаем текущую директорию (относительно которой будем считать пути)
CURRENT_DIR="$(pwd)"

# Очищаем выходной файл, если он существует
> "$OUTPUT_FILE"

# Функция для обработки файлов в директории
process_directory() {
    local dir="$1"
    
    # Перебираем все элементы в директории
    for item in "$dir"/*; do
        # Проверяем, существует ли элемент (на случай пустой директории)
        if [ ! -e "$item" ]; then
            continue
        fi
        
        # Если это директория, рекурсивно обрабатываем её
        if [ -d "$item" ]; then
            process_directory "$item"
        # Если это файл, читаем его содержимое
        elif [ -f "$item" ]; then
            # Вычисляем относительный путь от текущей директории
            relative_path="${item#$CURRENT_DIR/}"
            
            echo "Чтение файла: $relative_path" >> "$OUTPUT_FILE"
            echo "----------------------------------------" >> "$OUTPUT_FILE"
            
            # Пытаемся прочитать содержимое файла как текст
            if file "$item" | grep -q text; then
                cat "$item" >> "$OUTPUT_FILE" 2>/dev/null
            else
                echo "[Бинарный файл - содержимое не отображается]" >> "$OUTPUT_FILE"
            fi
            
            echo "" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
        fi
    done
}

# Запускаем обработку с текущей директории
echo "Начинаем обработку файлов в: $CURRENT_DIR"
echo "Результат будет сохранён в: $OUTPUT_FILE"
echo ""

process_directory "$CURRENT_DIR"

echo "Готово! Все файлы обработаны."
echo "Результат сохранён в $OUTPUT_FILE"