USE library_db;

-- Sample Authors (5)
INSERT INTO authors (name, bio, birth_year, country) VALUES
('J.K. Rowling', 'British author best known for the Harry Potter series', 1965, 'United Kingdom'),
('George Orwell', 'English novelist and essayist, known for dystopian fiction', 1903, 'United Kingdom'),
('Harper Lee', 'American novelist known for To Kill a Mockingbird', 1926, 'United States'),
('F. Scott Fitzgerald', 'American novelist of the Jazz Age', 1896, 'United States'),
('Gabriel Garcia Marquez', 'Colombian novelist, winner of Nobel Prize in Literature', 1927, 'Colombia');

-- Sample Categories (4)
INSERT INTO categories (category_name, description) VALUES
('Fiction', 'Imaginative narrative in prose form'),
('Classic Literature', 'Works recognized as of high quality and lasting significance'),
('Science Fiction', 'Fiction dealing with futuristic scientific and technological themes'),
('Mystery', 'Fiction dealing with the solution of a crime or puzzle');

-- Sample Users (3: 1 admin, 2 members) - passwords are hashed 'password123'
INSERT INTO users (username, email, password_hash, full_name, phone, address, role) VALUES
('admin', 'admin@library.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk8i5ZvuS', 'Library Admin', '555-0100', '123 Library St, BookCity, BC 12345', 'admin'),
('user1', 'user1@library.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk8i5ZvuS', 'Alice Johnson', '555-0101', '456 Reader Ave, BookCity, BC 12345', 'member'),
('user2', 'user2@library.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk8i5ZvuS', 'Bob Smith', '555-0102', '789 Novel Blvd, BookCity, BC 12345', 'member');

-- Sample Books (15)
INSERT INTO books (title, authorId, categoryId, isbn, publication_year, publisher, total_copies, available_copies, description) VALUES
('Harry Potter and the Sorcerers Stone', 1, 1, '978-0-439-70818-8', 1997, 'Scholastic', 5, 3, 'A young wizard discovers his magical heritage on his 11th birthday.'),
('Harry Potter and the Chamber of Secrets', 1, 1, '978-0-439-06486-6', 1998, 'Scholastic', 4, 4, 'Harry returns to Hogwarts for his second year at school.'),
('Harry Potter and the Prisoner of Azkaban', 1, 1, '978-0-439-13635-5', 1999, 'Scholastic', 4, 2, 'Harry learns about a dangerous prisoner who has escaped from Azkaban.'),
('Nineteen Eighty-Four', 2, 2, '978-0-452-28423-4', 1949, 'Secker & Warburg', 3, 3, 'A dystopian novel set in a totalitarian state under constant surveillance.'),
('Animal Farm', 2, 2, '978-0-452-28424-1', 1945, 'Secker & Warburg', 5, 5, 'An allegorical novella reflecting events leading up to the Russian Revolution.'),
('To Kill a Mockingbird', 3, 2, '978-0-061-93564-0', 1960, 'J. B. Lippincott & Co.', 4, 4, 'A story of racial injustice and the loss of innocence in the American South.'),
('Go Set a Watchman', 3, 1, '978-0-062-40985-0', 2015, 'HarperCollins', 3, 3, 'An adult Scout Finch visits her father in Maycomb, Alabama.'),
('The Great Gatsby', 4, 2, '978-0-743-27356-5', 1925, 'Charles Scribners Sons', 4, 4, 'A story of wealth, class, love, and idealism in the Jazz Age.'),
('Tender Is the Night', 4, 1, '978-0-684-80154-7', 1934, 'Charles Scribners Sons', 2, 2, 'A novel about the decline of Dick Diver, an American psychiatrist.'),
('One Hundred Years of Solitude', 5, 1, '978-0-060-88328-7', 1967, 'Harper & Row', 3, 2, 'The story of the Buendia family across seven generations.'),
('Love in the Time of Cholera', 5, 1, '978-0-307-38987-9', 1985, 'Editorial Oveja Negra', 3, 3, 'A story about unrequited love that spans over fifty years.'),
('Chronicle of a Death Foretold', 5, 4, '978-0-307-38986-2', 1981, 'Editorial La Oveja Negra', 4, 4, 'A reconstruction of the events surrounding a murder in a small Colombian town.'),
('Brave New World', 2, 3, '978-0-060-85052-4', 1932, 'Chatto & Windus', 3, 3, 'A dystopian novel about a futuristic World State of genetically modified citizens.'),
('The Giver', 3, 3, '978-0-395-64566-6', 1993, 'Houghton Mifflin', 4, 4, 'A young boy in a seemingly perfect society is chosen to be the Receiver of Memory.'),
('Fahrenheit 451', 2, 3, '978-0-345-34296-6', 1953, 'Ballantine Books', 3, 2, 'A novel about a future where books are outlawed and burned by firemen.');

-- Sample Borrow Records (10)
INSERT INTO borrows (userId, bookId, borrow_date, due_date, return_date, status) VALUES
(2, 1, '2024-01-05 10:00:00', '2024-01-19', '2024-01-18', 'returned'),
(2, 4, '2024-01-10 11:00:00', '2024-01-24', '2024-01-22', 'returned'),
(3, 6, '2024-01-15 09:00:00', '2024-01-29', '2024-01-28', 'returned'),
(3, 8, '2024-01-20 14:00:00', '2024-02-03', '2024-02-01', 'returned'),
(2, 10, '2024-02-01 10:00:00', '2024-02-15', '2024-02-14', 'returned'),
(2, 3, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), NULL, 'active'),
(3, 1, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_ADD(CURDATE(), INTERVAL 6 DAY), NULL, 'active'),
(2, 15, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), NULL, 'overdue'),
(3, 11, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), NULL, 'active'),
(2, 13, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), NULL, 'active');

-- Sample Reviews (15)
INSERT INTO reviews (userId, bookId, rating, review_text, review_date) VALUES
(2, 1, 5, 'An absolute classic! The magic and adventure are captivating.', '2024-01-20 10:00:00'),
(3, 1, 4, 'Wonderful story for all ages. Highly recommend!', '2024-01-22 11:00:00'),
(2, 4, 5, 'A chilling masterpiece. More relevant today than ever.', '2024-01-25 09:00:00'),
(3, 6, 5, 'One of the greatest American novels ever written.', '2024-01-30 14:00:00'),
(2, 8, 4, 'Beautiful prose and a fascinating look at 1920s America.', '2024-02-03 10:00:00'),
(3, 8, 5, 'Fitzgerald at his finest. The symbolism is masterful.', '2024-02-05 11:00:00'),
(2, 10, 5, 'Magical realism at its best. Unforgettable storytelling.', '2024-02-16 09:00:00'),
(3, 4, 4, 'Dark and thought-provoking. Big Brother is watching!', '2024-01-27 14:00:00'),
(2, 5, 5, 'Simple yet profound. A brilliant political allegory.', '2024-01-28 15:00:00'),
(3, 5, 4, 'Short but powerful. Essential reading for everyone.', '2024-01-29 16:00:00'),
(2, 13, 4, 'A fascinating look at a possible future. Thought-provoking.', '2024-02-08 10:00:00'),
(3, 13, 5, 'A classic that still feels relevant today.', '2024-02-09 11:00:00'),
(2, 6, 5, 'Moving and important. Changed my perspective on justice.', '2024-02-10 12:00:00'),
(3, 11, 4, 'Beautiful love story. Garcia Marquez is extraordinary.', '2024-02-12 13:00:00'),
(2, 15, 5, 'A warning for our times. Brilliant science fiction.', '2024-02-14 14:00:00');

-- Sample Admin Logs
INSERT INTO admin_logs (adminId, action, details) VALUES
(1, 'USER_CREATED', 'System initialization - admin account created'),
(1, 'BOOKS_IMPORTED', 'Initial book catalog of 15 books imported'),
(1, 'SYSTEM_SETUP', 'Database schema and sample data loaded');
