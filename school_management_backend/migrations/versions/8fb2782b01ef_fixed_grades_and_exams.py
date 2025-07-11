"""Fixed grades and exams

Revision ID: 8fb2782b01ef
Revises: d52997b59fa5
Create Date: 2025-07-11 12:10:30.366999
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '8fb2782b01ef'
down_revision = 'd52997b59fa5'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('grades', schema=None) as batch_op:
        batch_op.add_column(sa.Column('exam_id', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))
        batch_op.alter_column('teacher_id',
            existing_type=sa.INTEGER(),
            nullable=True)
        batch_op.alter_column('term',
            existing_type=sa.VARCHAR(length=10),
            nullable=False)
        batch_op.alter_column('year',
            existing_type=sa.INTEGER(),
            nullable=False)
        batch_op.create_foreign_key(
            'fk_grades_exam_id',  # Name of the foreign key constraint
            'exams',              # Referenced table
            ['exam_id'],          # Local column
            ['exam_id']           # Referenced column
        )

def downgrade():
    with op.batch_alter_table('grades', schema=None) as batch_op:
        batch_op.drop_constraint('fk_grades_exam_id', type_='foreignkey')
        batch_op.alter_column('year',
            existing_type=sa.INTEGER(),
            nullable=True)
        batch_op.alter_column('term',
            existing_type=sa.VARCHAR(length=10),
            nullable=True)
        batch_op.alter_column('teacher_id',
            existing_type=sa.INTEGER(),
            nullable=False)
        batch_op.drop_column('created_at')
        batch_op.drop_column('exam_id')
