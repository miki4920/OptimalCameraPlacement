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



