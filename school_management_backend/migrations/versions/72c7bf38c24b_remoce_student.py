"""remoce student 

Revision ID: 72c7bf38c24b
Revises: e0806a27210a
Create Date: 2025-07-17 14:36:14.126278

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '72c7bf38c24b'
down_revision = 'e0806a27210a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('grades', schema=None) as batch_op:
        batch_op.drop_column('student_id')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('grades', schema=None) as batch_op:
        batch_op.add_column(sa.Column('student_id', sa.INTEGER(), nullable=False))
        batch_op.create_foreign_key(None, 'students', ['student_id'], ['student_id'])

    # ### end Alembic commands ###
