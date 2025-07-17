"""Re-add exam_schedule_id FK

Revision ID: 87ba2474c8eb
Revises: e62a8d2df8ac
Create Date: 2025-07-17 12:55:42.192809
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '87ba2474c8eb'
down_revision = 'e62a8d2df8ac'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('grades', schema=None) as batch_op:
        batch_op.add_column(sa.Column('exam_schedule_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key(
            'fk_grades_exam_schedule_id',  # ✅ named constraint
            'exam_schedules',
            ['exam_schedule_id'],
            ['id']
        )

def downgrade():
    with op.batch_alter_table('grades', schema=None) as batch_op:
        batch_op.drop_constraint('fk_grades_exam_schedule_id', type_='foreignkey')
        batch_op.drop_column('exam_schedule_id')

    # ### end Alembic commands ###
