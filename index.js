const sequelize = require("./db");
const { User, Post, Author, Book, Student, Course, Order, Item } = require("./models");
const tasks = require("./tasks");

async function seed() {
    // пользователи: у Вовы нет ни одного поста
    const anya = await User.create({ name: "Аня", email: "anya@mail.ru", isActive: true });
    const borya = await User.create({ name: "Боря", email: "borya@mail.ru", isActive: false });
    await User.create({ name: "Вова", email: "vova@mail.ru", isActive: true });

    await anya.createPost({ title: "Что такое ORM", publishedAt: "2024-03-01", status: "published" });
    await anya.createPost({ title: "Черновик про SQL", publishedAt: "2022-06-01", status: "draft" });
    await borya.createPost({ title: "Старый пост", publishedAt: "2023-05-01", status: "archived" });

    // авторы: у Джойс нет книг
    const tolkien = await Author.create({ firstName: "Джон", lastName: "Толкин", country: "Англия" });
    await Author.create({ firstName: "Джеймс", lastName: "Джойс", country: "Ирландия" });
    const remarque = await Author.create({ firstName: "Эрих", lastName: "Ремарк", country: "Германия" });

    await tolkien.createBook({ title: "Хоббит", year: 1937, genre: "Фэнтези" });
    await tolkien.createBook({ title: "Властелин колец", year: 1954, genre: "Фэнтези" });
    await remarque.createBook({ title: "На западном фронте без перемен", year: 1929, genre: "Роман" });

    // студенты и курсы: курс JS — 5 кредитов, Матан — 2
    const petya = await Student.create({ name: "Петя", group: "ИС-21" });
    const katya = await Student.create({ name: "Катя", group: "ИС-21" });

    const js = await Course.create({ title: "Основы JavaScript", credits: 5 });
    const matan = await Course.create({ title: "Математический анализ", credits: 2 });

    await petya.addCourse(js, { through: { grade: 85 } });
    await petya.addCourse(matan, { through: { grade: 70 } });
    await katya.addCourse(matan, { through: { grade: 92 } });

    // заказы: во втором заказе нет товаров с количеством больше 2
    const order1 = await Order.create({ number: "ORD-001", status: "paid" });
    const order2 = await Order.create({ number: "ORD-002", status: "new" });

    await order1.createItem({ productName: "Монитор", quantity: 3, price: 25000 });
    await order1.createItem({ productName: "Клавиатура", quantity: 1, price: 3500 });
    await order2.createItem({ productName: "Мышь", quantity: 1, price: 800 });
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log("Подключение к базе данных установлено");

        await sequelize.sync({ force: true });
        await seed();
        console.log("Тестовые данные добавлены\n");

        // 1
        const users = await tasks.getUsersWithRecentPosts();
        console.log("=== 1. Пользователи с постами после 2023-01-01 ===");
        users.forEach(u => {
            console.log(`- ${u.name}: ${u.posts.map(p => p.title).join(", ")}`);
        });

        // 2
        const authors = await tasks.getAllAuthorsIncludingEmpty();
        console.log("\n=== 2. Авторы (включая без книг) ===");
        authors.forEach(a => {
            console.log(`- ${a.lastName} ${a.firstName}: книг ${a.books.length}`);
        });

        // 3
        const students = await tasks.getStudentsInAdvancedCourses();
        console.log("\n=== 3. Студенты на курсах с credits > 3 ===");
        students.forEach(s => {
            console.log(`- ${s.name}: ${s.courses.map(c => `${c.title} (${c.credits})`).join(", ")}`);
        });

        // 4
        const orders = await tasks.getOrdersWithBulkItems();
        console.log("\n=== 4. Заказы с товарами количество > 2 ===");
        orders.forEach(o => {
            console.log(`- ${o.number} (${o.status}): ${o.items.map(i => `${i.productName} x${i.quantity}`).join(", ")}`);
        });

        // 5
        const actives = await tasks.getActiveUsersWithPublishedPosts();
        console.log("\n=== 5. Активные пользователи с опубликованными постами ===");
        actives.forEach(u => {
            console.log(`- ${u.name}: ${u.posts.map(p => `${p.title} (${p.status})`).join(", ")}`);
        });
    } catch (error) {
        console.error("Ошибка:", error.message);
    } finally {
        await sequelize.close();
        console.log("\nСоединение закрыто");
    }
}

main();