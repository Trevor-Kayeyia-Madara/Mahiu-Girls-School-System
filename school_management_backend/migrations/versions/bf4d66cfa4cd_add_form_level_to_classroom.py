"""Add form_level to Classroom

Revision ID: bf4d66cfa4cd
Revises: ef452a94a863
Create Date: 2025-07-16 09:06:30.054117

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bf4d66cfa4cd'
down_revision = 'ef452a94a863'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('classrooms', schema=None) as batch_op:
        batch_op.add_column(sa.Column('form_level', sa.String(length=20), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('classrooms', schema=None) as batch_op:
        batch_op.drop_column('form_level')

    # ### end Alembic commands ###
