module.exports = {
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: 'gobarber',
    database: 'goBarber',
    define: {
        timestamps: true,
        underscored: true,   // deixa os nomes das tabelas assim -> user_group
        underscoredAll: true, //faz a mesma coisa, mas com os nomes das colunas
    }
}