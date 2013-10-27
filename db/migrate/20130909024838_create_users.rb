class CreateUsers < ActiveRecord::Migration
  def up
    create_table :users do |t|
      t.string :email, null: false
      t.index :email
      t.string :password
      t.string :token
      t.timestamps
    end
  end
 
  def down
    drop_table :users
  end
end
