from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'aebdda164837'
down_revision = '332897372e36'  # Replace with your previous migration ID
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('messages', sa.Column('read', sa.Boolean(), nullable=True))


def downgrade():
    op.drop_column('messages', 'read')
