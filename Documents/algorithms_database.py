from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref, sessionmaker
from sqlalchemy.sql import exists

Base = declarative_base()

algorithms_table = Table("source_algorithm", Base.metadata,
                         Column("source_id", String(256), ForeignKey("source.id"), primary_key=True),
                         Column("algorithm_id", String(256), ForeignKey("algorithm.id"), primary_key=True))


class Algorithm(Base):
    __tablename__ = "algorithm"
    id = Column(String(256), primary_key=True)
    sources = relationship("Source", secondary=algorithms_table, backref=backref("algorithms"))


class Source(Base):
    __tablename__ = "source"
    id = Column(String(256), primary_key=True)


engine = create_engine('sqlite:///Documents/algorithms.db')
session = sessionmaker(bind=engine)()
Base.metadata.create_all(engine)

source = input("Source: ")
algorithm = input("Algorithm: ")

source_exists = session.query(Source).filter(Source.id == source).first()
source_exists = source_exists if source_exists else None

algorithm_exists = session.query(Algorithm).filter(Algorithm.id == algorithm).first()
algorithm_exists = algorithm_exists if algorithm_exists else None

if source_exists and algorithm_exists:
    quit()
if not source_exists:
    source = Source(id=source)
    session.add(source)
else:
    source = session.query(Source).filter(Source.id == source).first()
if not algorithm_exists:
    algorithm = Algorithm(id=algorithm)
    session.add(algorithm)
else:
    algorithm = session.query(Algorithm).filter(Algorithm.id == algorithm).first()

algorithm.sources.append(source)
session.commit()