class AddTypeToTransaction < ActiveRecord::Migration
  def change
    add_column :transactions, :creator_id, :integer, null: false
    add_column :transactions, :creator_type, :string, null: false
  end
end
