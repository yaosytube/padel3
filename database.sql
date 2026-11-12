-- Padel Avenue — base de données MySQL / MariaDB
CREATE DATABASE IF NOT EXISTS padel_avenue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE padel_avenue;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  image VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('nouvelle','confirmee','expediee','annulee') NOT NULL DEFAULT 'nouvelle',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

INSERT INTO products (id, category, name, price, image) VALUES
 (1,'Raquettes','Elite Gold',289,'images/racket.jpg'),
 (2,'Balles','Premium Balls',25,'images/balls.jpg'),
 (3,'Sacs','Black Edition',119,'images/bag.jpg'),
 (4,'Chaussures','Court Pro',199,'images/shoes.jpg')
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), image=VALUES(image);
