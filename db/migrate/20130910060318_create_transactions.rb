class CreateTransactions < ActiveRecord::Migration
  def change
    create_table :transactions do |t|
      t.belongs_to :bank
      t.float :amount, default: 0
      t.timestamps
    end
    add_index :transactions, :bank_id
  end
end
