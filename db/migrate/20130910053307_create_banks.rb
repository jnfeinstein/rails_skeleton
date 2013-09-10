class CreateBanks < ActiveRecord::Migration
  def change
    create_table :banks do |t|
      t.belongs_to :user
      t.float :total
      t.timestamps
    end
  end
end
