"""Add subject_id to grades

Revision ID: 8f615dd39ab7
Revises: eebc4ba45b9b
Create Date: 2025-07-17 14:43:31.490282

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8f615dd39ab7'
down_revision = 'eebc4ba45b9b'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('grades', schema=None) as batch_op:
        batch_op.add_column(sa.Column('subject_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key('fk_grades_subject_id', 'subjects', ['subject_id'], ['subject_id'])


    # ### end Alembic commands ###


def downgrade():
    with op.batch_alter_table('grades', schema=None) as batch_op:
        batch_op.drop_constraint('fk_grades_subject_id', type_='foreignkey')
        batch_op.drop_column('subject_id')