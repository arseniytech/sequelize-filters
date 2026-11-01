# sequelize-filters

Практическая работа: фильтрация и сортировка связанных данных в Sequelize + SQLite. Пять учебных запросов: вложенный `where`, `required: true/false`, многоуровневый `order`, фильтрация в N:M.

## Запуск

```bash
npm install
node index.js
```

Скрипт создаёт базу `queries.sqlite`, наполняет её тестовыми данными и последовательно выполняет все 5 заданий.

## Предметная область

9 моделей и 4 вида ассоциаций:

| Модели | Связь | Псевдоним |
| --- | --- | --- |
| User — Post | 1:N, `authorId` | `posts` / `author` |
| Author — Book | 1:N, `authorId` | `books` / `author` |
| Student — Course (через Enrollment) | N:M | `courses` / `students` |
| Order — Item | 1:N, `orderId` | `items` / `order` |

## Задания (`tasks.js`)

1. **getUsersWithRecentPosts** — пользователи с постом после 01.01.2023: вложенный `where` в `include`, `required: true`, сортировка пользователей по имени (ASC) и постов по дате (DESC).
2. **getAllAuthorsIncludingEmpty** — все авторы, включая без книг: `required: false` (LEFT JOIN), у пустых `books` — пустой массив.
3. **getStudentsInAdvancedCourses** — студенты на курсах с `credits > 3`: фильтрация в N:M, `through: { attributes: [] }` прячет поля Enrollment.
4. **getOrdersWithBulkItems** — заказы с товаром `quantity > 2`: `where` + `required: true` на уровне items, два уровня `order` (заказы по createdAt DESC, товары по цене DESC).
5. **getActiveUsersWithPublishedPosts** — комбинированный фильтр: `isActive` в верхнеуровневом `where`, `status` во вложенном `where`.

В каждой функции есть комментарий, поясняющий роль `where`, `required` и `order`.

## Тестовые данные

- 3 пользователя, у Вовы нет постов;
- 3 автора, у Джойса нет книг;
- 2 студента на курсах разной кредитности (5 и 2);
- 2 заказа, во втором нет товаров с количеством больше 2.

## Структура

```
db.js            — экземпляр Sequelize (dialect: sqlite)
models/          — 9 моделей + models/index.js с ассоциациями
tasks.js         — пять функций заданий 1-5
index.js         — сид данных и последовательный вывод результатов
queries.sqlite   — файл базы (в git не попадает)
```