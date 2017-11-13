# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20171111222902) do

  create_table "comments", force: :cascade do |t|
    t.integer "user_id"
    t.integer "post_id"
    t.string "text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "post_teams", force: :cascade do |t|
    t.integer "post_id"
    t.integer "team_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_post_teams_on_post_id"
    t.index ["team_id"], name: "index_post_teams_on_team_id"
  end

  create_table "posts", force: :cascade do |t|
    t.integer "user_id"
    t.string "title"
    t.text "content"
    t.string "thumbnail_url"
    t.string "sport"
    t.datetime "time_approved"
    t.string "status"
    t.string "admin_message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "time_submitted"
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "rs_evaluations", force: :cascade do |t|
    t.string "reputation_name"
    t.string "source_type"
    t.integer "source_id"
    t.string "target_type"
    t.integer "target_id"
    t.float "value", default: 0.0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "data"
    t.index ["reputation_name", "source_id", "source_type", "target_id", "target_type"], name: "index_rs_evaluations_on_reputation_name_and_source_and_target", unique: true
    t.index ["reputation_name"], name: "index_rs_evaluations_on_reputation_name"
    t.index ["source_id", "source_type"], name: "index_rs_evaluations_on_source_id_and_source_type"
    t.index ["source_type", "source_id"], name: "index_rs_evaluations_on_source_type_and_source_id"
    t.index ["target_id", "target_type"], name: "index_rs_evaluations_on_target_id_and_target_type"
    t.index ["target_type", "target_id"], name: "index_rs_evaluations_on_target_type_and_target_id"
  end

  create_table "rs_reputation_messages", force: :cascade do |t|
    t.string "sender_type"
    t.integer "sender_id"
    t.integer "receiver_id"
    t.float "weight", default: 1.0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["receiver_id", "sender_id", "sender_type"], name: "index_rs_reputation_messages_on_receiver_id_and_sender", unique: true
    t.index ["receiver_id"], name: "index_rs_reputation_messages_on_receiver_id"
    t.index ["sender_id", "sender_type"], name: "index_rs_reputation_messages_on_sender_id_and_sender_type"
    t.index ["sender_type", "sender_id"], name: "index_rs_reputation_messages_on_sender_type_and_sender_id"
  end

  create_table "rs_reputations", force: :cascade do |t|
    t.string "reputation_name"
    t.float "value", default: 0.0
    t.string "aggregated_by"
    t.string "target_type"
    t.integer "target_id"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "data"
    t.index ["reputation_name", "target_id", "target_type"], name: "index_rs_reputations_on_reputation_name_and_target", unique: true
    t.index ["reputation_name"], name: "index_rs_reputations_on_reputation_name"
    t.index ["target_id", "target_type"], name: "index_rs_reputations_on_target_id_and_target_type"
    t.index ["target_type", "target_id"], name: "index_rs_reputations_on_target_type_and_target_id"
  end

  create_table "teams", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "sport_string"
  end

  create_table "user_teams", force: :cascade do |t|
    t.integer "user_id"
    t.integer "team_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["team_id"], name: "index_user_teams_on_team_id"
    t.index ["user_id"], name: "index_user_teams_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "admin"
    t.string "bio"
    t.string "profile_image_url"
    t.string "picture"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
