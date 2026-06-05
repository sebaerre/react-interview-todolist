import { test, expect, type APIRequestContext } from "@playwright/test";

// ─── API helpers ────────────────────────────────────────────────────────────

async function createListViaApi(request: APIRequestContext, name: string) {
  const resp = await request.post("/api/todolists", { data: { name } });
  return (await resp.json()) as { id: string; name: string };
}

async function createItemViaApi(
  request: APIRequestContext,
  listId: string,
  name: string,
) {
  const resp = await request.post(`/api/todolists/${listId}/todoitems`, {
    data: { name },
  });
  return (await resp.json()) as {
    id: number;
    todoList: string;
    name: string;
    done: boolean;
  };
}

async function deleteListViaApi(request: APIRequestContext, id: string) {
  await request.delete(`/api/todolists/${id}`);
}

function uniqueListName() {
  return `Test List ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function uniqueTodoName() {
  return `Todo ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe("1. Creating a todo list", () => {
  test("creates a new todo list via the UI and displays it", async ({
    page,
    request,
  }) => {
    const listName = uniqueListName();

    await page.goto("/");

    await page.getByRole("button", { name: "+ New list" }).click();
    await page.getByRole("textbox", { name: "List name" }).fill(listName);
    await page.keyboard.press("Enter");

    // List appears in the sidebar
    await expect(
      page.getByRole("button").filter({ hasText: listName }),
    ).toBeVisible();

    // Todo panel opens and shows the list name
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      listName,
    );

    await expect(page.getByText("List created")).toBeVisible();

    // Cleanup: find list by name and delete via API
    const lists = (await (await request.get("/api/todolists")).json()) as {
      id: string;
      name: string;
    }[];
    const created = lists.find((l) => l.name === listName);
    if (created) await deleteListViaApi(request, created.id);
  });
});

test.describe("with a pre-created list", () => {
  let listId: string;
  let listName: string;

  test.beforeEach(async ({ request }) => {
    listName = uniqueListName();
    const list = await createListViaApi(request, listName);
    listId = list.id;
  });

  test.afterEach(async ({ request }) => {
    try {
      await deleteListViaApi(request, listId);
    } catch {
      // list was already deleted by the test itself (test 6)
    }
  });

  test("2. views the todo list in the todo panel", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button").filter({ hasText: listName }).click();

    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      listName,
    );
  });

  test("3. creates a todo item within the list", async ({ page }) => {
    const todoName = uniqueTodoName();

    await page.goto("/");
    await page.getByRole("button").filter({ hasText: listName }).click();

    await page.getByRole("button", { name: "Add todo", exact: false }).click();
    await page.getByRole("textbox", { name: "New todo name" }).fill(todoName);
    await page.keyboard.press("Enter");

    await expect(page.getByRole("checkbox", { name: todoName })).toBeVisible();
    await expect(page.getByText("Todo added")).toBeVisible();
  });

  test("7. renames a todo list", async ({ page }) => {
    const newListName = uniqueListName();

    await page.goto("/");

    // Select the list so TodoPanel / header renders with the rename button
    await page.getByRole("button").filter({ hasText: listName }).click();

    await page.getByRole("button", { name: `Rename ${listName}` }).click();
    await page
      .getByRole("textbox", { name: `Rename ${listName}` })
      .fill(newListName);
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("button").filter({ hasText: newListName }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      newListName,
    );
    await expect(page.getByText("List name updated")).toBeVisible();
  });

  test("9. marks all todo items as complete", async ({ page, request }) => {
    const todoName1 = uniqueTodoName();
    const todoName2 = uniqueTodoName();
    await createItemViaApi(request, listId, todoName1);
    await createItemViaApi(request, listId, todoName2);

    await page.goto("/");
    await page.getByRole("button").filter({ hasText: listName }).click();

    await page.getByRole("button", { name: "Complete all" }).click();

    await expect(
      page.getByRole("checkbox", { name: todoName1 }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByRole("checkbox", { name: todoName2 }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByRole("button", { name: "Complete all" }),
    ).toBeDisabled();
    await expect(page.getByText("All todos completed")).toBeVisible();
  });

  test.describe("with a pre-created todo item", () => {
    let itemName: string;

    test.beforeEach(async ({ request }) => {
      itemName = uniqueTodoName();
      await createItemViaApi(request, listId, itemName);
    });

    test("4. marks a todo item as completed", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button").filter({ hasText: listName }).click();

      const checkbox = page.getByRole("checkbox", { name: itemName });
      await expect(checkbox).toHaveAttribute("aria-checked", "false");

      await checkbox.click();

      await expect(checkbox).toHaveAttribute("aria-checked", "true");
      await expect(page.getByText("Todo updated successfully")).toBeVisible();
    });

    test("5. deletes a todo item", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button").filter({ hasText: listName }).click();

      // Hover the todo row to reveal the opacity-0 delete button
      const todoRow = page
        .locator(".group")
        .filter({ has: page.getByRole("checkbox", { name: itemName }) });
      await todoRow.hover();

      await page.getByRole("button", { name: `Delete ${itemName}` }).click();

      await expect(page.getByText(`Item "${itemName}" deleted`)).toBeVisible();
      await expect(
        page.getByRole("checkbox", { name: itemName }),
      ).not.toBeVisible();
    });

    test("8. renames a todo item", async ({ page }) => {
      const newItemName = uniqueTodoName();

      await page.goto("/");
      await page.getByRole("button").filter({ hasText: listName }).click();

      const todoRow = page
        .locator(".group")
        .filter({ has: page.getByRole("checkbox", { name: itemName }) });
      await todoRow.hover();

      await page.getByRole("button", { name: `Rename ${itemName}` }).click();
      await page
        .getByRole("textbox", { name: `Rename ${itemName}` })
        .fill(newItemName);
      await page.keyboard.press("Enter");

      await expect(
        page.getByRole("checkbox", { name: newItemName }),
      ).toBeVisible();
      await expect(page.getByText("Todo updated successfully")).toBeVisible();
    });
  });

  test("6. deletes a todo list", async ({ page }) => {
    await page.goto("/");

    // Hover the sidebar list row to reveal the opacity-0 delete button
    const listRow = page
      .locator(".group")
      .filter({ has: page.getByRole("button").filter({ hasText: listName }) })
      .first();
    await listRow.hover();

    await page.getByRole("button", { name: `Delete ${listName}` }).click();

    await expect(page.getByText(`List "${listName}" deleted`)).toBeVisible();
    await expect(
      page.getByRole("button").filter({ hasText: listName }),
    ).not.toBeVisible();
  });
});
