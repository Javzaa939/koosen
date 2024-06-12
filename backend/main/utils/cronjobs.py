from main.utils.function.utils import create_backup


def dbCreateBackup():
    """ Backup үүсгэх """

    db_pass = '7F5Yre5JAtYeYyyr'
    port = '5432'
    data_base = 'dxis'
    db_user_name = 'dxis_user'
    host = 'localhost'

    create_backup(db_pass, db_user_name, data_base, host, port)
