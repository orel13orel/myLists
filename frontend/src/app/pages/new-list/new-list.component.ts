import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { Router } from '@angular/router';
import { List } from 'src/app/models/list.nodel';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  constructor(private taskService: TaskService, private router: Router) { }

  ngOnInit(): void {
  }
  createList(title: string) {
    this.taskService.createList(title).subscribe((task: List) => {
      console.log(task);

      // redirect to /lists/task._id
      this.router.navigate(['/lists', task._id] );
  });
}
}
