class AddUserIdIndexToBanks < ActiveRecord::Migration
  def change
    add_index :banks, :user_id
  end
end
