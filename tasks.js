const { Op } = require("sequelize");
const { User, Post, Author, Book, Student, Course, Order, Item } = require("./models");

// Задание 1. Пользователи с постами после 2023-01-01.
// where внутри include фильтрует посты ДО JOIN, required: true отсеивает
// пользователей без подходящих постов (INNER JOIN), вложенный order
// сортирует посты по дате внутри каждого пользователя.
async function getUsersWithRecentPosts() {
    return User.findAll({
        include: [{
            model: Post,
            as: "posts",
            where: { publishedAt: { [Op.gt]: "2023-01-01" } },
            required: true
        }],
        order: [
            ["name", "ASC"],
            [{ model: Post, as: "posts" }, "publishedAt", "DESC"]
        ]
    });
}

// Задание 2. Авторы, включая тех, у кого нет книг.
// required: false оставляет LEFT JOIN — у авторов без книг поле books
// будет пустым массивом, сами авторы никуда не теряются.
async function getAllAuthorsIncludingEmpty() {
    return Author.findAll({
        include: [{
            model: Book,
            as: "books",
            required: false
        }],
        order: [["lastName", "ASC"]]
    });
}

// Задание 3. Студенты, записанные на курс с credits > 3.
// через: { attributes: [] } прячет поля соединительной таблицы Enrollment,
// required: true на уровне курса убирает студентов без подходящих курсов.
async function getStudentsInAdvancedCourses() {
    return Student.findAll({
        include: [{
            model: Course,
            as: "courses",
            where: { credits: { [Op.gt]: 3 } },
            required: true,
            through: { attributes: [] }
        }],
        order: [
            ["name", "ASC"],
            [{ model: Course, as: "courses" }, "title", "ASC"]
        ]
    });
}

// Задание 4. Заказы с товаром, где количество больше 2.
// where и required: true на уровне items, сортировка заказов по createdAt
// и товаров по цене — два уровня order в одном вызове.
async function getOrdersWithBulkItems() {
    return Order.findAll({
        include: [{
            model: Item,
            as: "items",
            where: { quantity: { [Op.gt]: 2 } },
            required: true
        }],
        order: [
            ["createdAt", "DESC"],
            [{ model: Item, as: "items" }, "price", "DESC"]
        ]
    });
}

// Задание 5. Активные пользователи с опубликованными постами.
// isActive — в верхнеуровневом where (поле родителя), status — во
// вложенном where (поле связанной модели), порядок: имя ASC, посты DESC.
async function getActiveUsersWithPublishedPosts() {
    return User.findAll({
        where: { isActive: true },
        include: [{
            model: Post,
            as: "posts",
            where: { status: "published" },
            required: true
        }],
        order: [
            ["name", "ASC"],
            [{ model: Post, as: "posts" }, "createdAt", "DESC"]
        ]
    });
}

module.exports = {
    getUsersWithRecentPosts,
    getAllAuthorsIncludingEmpty,
    getStudentsInAdvancedCourses,
    getOrdersWithBulkItems,
    getActiveUsersWithPublishedPosts
};