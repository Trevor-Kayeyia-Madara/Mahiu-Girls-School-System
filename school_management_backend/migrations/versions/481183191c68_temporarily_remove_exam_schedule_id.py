"""Temporarily remove exam_schedule_id

Revision ID: 481183191c68
Revises: c1a1911d6a2a
Create Date: 2025-07-17 12:49:41.408605
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '481183191c68'
down_revision = 'c1a1911d6a2a'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('grades', schema=None) as batch_op:
        batch_op.add_column(sa.Column('marks', sa.Float(), nullable=False))
        # Removed unnamed drop_constraint lines
        batch_op.drop_column('class_id')
        batch_op.drop_column('subject_id')
        batch_op.drop_column('teacher_id')
        batch_op.drop_column('term')
        batch_op.drop_column('exam_id')
        batch_op.drop_column('year')
        batch_op.drop_column('score')


def downgrade():
    with op.batch_alter_table('grades', schema=None) as batch_op:
        batch_op.add_column(sa.Column('score', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('year', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('exam_id', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('term', sa.String(length=10), nullable=False))
        batch_op.add_column(sa.Column('teacher_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('subject_id', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('class_id', sa.Integer(), nullable=False))

        # Create constraints with names
        batch_op.create_foreign_key('fk_grades_exam_id', 'exams', ['exam_id'], ['exam_id'])
        batch_op.create_foreign_key('fk_grades_subject_id', 'subjects', ['subject_id'], ['subject_id'])
        batch_op.create_foreign_key('fk_grades_class_id', 'classrooms', ['class_id'], ['class_id'])
        batch_op.create_foreign_key('fk_grades_teacher_id', 'teachers', ['teacher_id'], ['teacher_id'])

        batch_op.drop_column('marks')

    # ### end Alembic commands ###
