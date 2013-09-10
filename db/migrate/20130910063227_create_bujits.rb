class CreateBujits < ActiveRecord::Migration
  def change
    create_table :bujits do |t|
      t.belongs_to :user
      t.float :amount, default: 0
      t.timestamps
    end
    add_index :bujits, :user_id
  end
end
