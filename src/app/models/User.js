const { Model } = require('sequelize')
const Sequelize = require('sequelize')
const bcrypt = require('bcryptjs')

class User extends Model {
    static init(sequelize) {
        //Coloca as colunas a serem preenchidas pelo usuário
        super.init(
            {
                name: Sequelize.STRING,
                email: Sequelize.STRING,
                password: Sequelize.VIRTUAL,
                password_hash: Sequelize.STRING,
                provider: Sequelize.BOOLEAN,
            },
            {
                sequelize
            }
        )

        this.addHook('beforeSave', async (user) => {
            if (user.password) {
                user.password_hash = await bcrypt.hash(user.password, 8)
            }
        })

        return this
    }

    //Relacionamento com a tabela file
    static associate(models){
        this.belongsTo(models.File, {foreignKey: 'avatar_id', as:'avatar'})
    }

    checkPassword(password) {
        return bcrypt.compare(password, this.password_hash)
    }
}

module.exports = User