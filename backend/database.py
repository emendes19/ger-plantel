from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de conexão com o MySQL local
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/ger_plantel"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Linha responsável por criar a sessão do banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()