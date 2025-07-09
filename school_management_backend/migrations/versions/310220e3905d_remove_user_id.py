"""Remove old message fields and redefine structure

Revision ID: 310220e3905d
Revises: aebdda164837
Create Date: 2025-07-08 11:32:28.851936
"""

from alembic import op
import sqlalchemy as sa


# Revision identifiers
revision = '310220e3905d'
down_revision = 'aebdda164837'
branch_labels = None
depends_on = None


def upgrade():
    # We're recreating the table structure for messages using batch_op
    with op.batch_alter_table('messages', schema=None) as batch_op:
        # Drop old columns
        batch_op.drop_column('message_id')
        batch_op.drop_column('message_text')
        batch_op.drop_column('recipient_id')
        batch_op.drop_column('sent_at')

        # Add new columns
        batch_op.add_column(sa.Column('id', sa.Integer(), primary_key=True))
        batch_op.add_column(sa.Column('receiver_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('content', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('timestamp', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('read', sa.Boolean(), default=False))

        # Alter sender_id to be nullable
        batch_op.alter_column('sender_id', existing_type=sa.INTEGER(), nullable=True)

        # Create FK for receiver_id (sender_id FK is assumed to already exist)
        batch_op.create_foreign_key('fk_messages_receiver', 'users', ['receiver_id'], ['user_id'])


def downgrade():
    with op.batch_alter_table('messages', schema=None) as batch_op:
        # Revert back to old structure
        batch_op.drop_constraint('fk_messages_receiver', type_='foreignkey')
        batch_op.drop_column('read')
        batch_op.drop_column('timestamp')
        batch_op.drop_column('content')
        batch_op.drop_column('receiver_id')
        batch_op.drop_column('id')

        batch_op.add_column(sa.Column('message_id', sa.INTEGER(), primary_key=True))
        batch_op.add_column(sa.Column('message_text', sa.TEXT(), nullable=False))
        batch_op.add_column(sa.Column('recipient_id', sa.INTEGER(), nullable=False))
        batch_op.add_column(sa.Column('sent_at', sa.DATETIME(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True))
        batch_op.alter_column('sender_id', existing_type=sa.INTEGER(), nullable=False)
        batch_op.create_foreign_key('fk_messages_recipient', 'users', ['recipient_id'], ['user_id'])
