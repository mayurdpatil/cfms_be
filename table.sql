create table user(
    id int primary key AUTO_INCREMENT,
    name varchar(255),
    contactNumber varchar(255),
    email varchar(255),
    password varchar(255),
    status varchar(20),
    role varchar(20),
    UNIQUE (email)
);

insert into user(name, contactNumber, email, password, status, role) values('Admin', '122111211', 'admin@gmail.com', 'admin', 'true', 'admin');


create table category(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    primary key(id)
)

create table product(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    category_id integer NOT NULL,
    description varchar(255),
    price integer,
    status varchar(20),
    primary key(id)
);

create table bill(
    id int NOT NULL AUTO_INCREMENT,
    uuid varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    contact_number varchar(25) NOT NULL,
    payment_method varchar(50) NOT NULL,
    total int NOT NULL,
    product_details JSON DEFAULT NULL,
    created_by varchar(255) NOT NULL,
    primary key(id)
);