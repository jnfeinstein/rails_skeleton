class MoveTransactionsToUser < ActiveRecord::Migration
  def change
    remove_index :transactions, :bank_id
    remove_column :transactions, :bank_id
    add_column :transactions, :user_id, :integer
    add_index :transactions, :user_id
  end
end
